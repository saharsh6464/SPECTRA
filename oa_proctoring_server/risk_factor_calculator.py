"""
Risk Factor Calculator for Online DSA Round Proctoring (Aggregated Input)
==========================================================================

Takes pre-aggregated numeric signals for a candidate's session (counts,
totals, durations) and computes a RiskFactor (0-100) with a risk level.

Input shape example:
    metrics = {
        "fullscreen_exit_count",
        "paste_count",
        "copy_count",
        "multiple_faces_count",
        "no_face_count",
        "phone_cell_count",
        "window_blur_count (combined tab switching, screenshots, and window blur)",
        "risk_audio_count(under this we consider the audio anomaly detection)",
    }

    calculator = RiskFactorCalculator()
    result = calculator.calculate(metrics)
    print(result.to_dict())

Any metric you don't have / don't track can simply be omitted - it's treated as
0 and contributes nothing. The default weights are percentage-point maximums:

    fullscreen_exit_count: 10
    window_blur_count (including tab switches and screenshots): 15
    paste_count: 15
    copy_count: 5
    multiple_faces_count: 25
    no_face_count: 15
    phone_cell_count: 10
    risk_audio_count: 5

The weights total 100, so ``total_score`` is the final risk percentage.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional
import json


class RiskLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class MetricRule:
    """Defines how one metric contributes to the risk score."""

    name: str
    category: str
    count_key: Optional[str] = None
    per_count_weight: float = 0.0
    volume_key: Optional[str] = None
    per_unit_weight: float = 0.0
    max_contribution: float = 100.0
    max_count_at_test_duration: float = 1.0
    flag_threshold: Optional[float] = None
    flag_message: Optional[str] = None


WINDOW_FOCUS_MAX_WEIGHT = 15


DEFAULT_RULES = [
    # max_count_at_test_duration is calibrated for a 180-minute test.
    MetricRule("fullscreen_exit", "environment", "fullscreen_exit_count", max_contribution=10, max_count_at_test_duration=10, flag_threshold=2, flag_message="Exited fullscreen {value} time(s)"),
    MetricRule("window_blur", "environment", "window_blur_count", max_contribution=15, max_count_at_test_duration=30, flag_threshold=10, flag_message="Window/tab focus changed {value} time(s)"),
    MetricRule("paste", "code_integrity", "paste_count", max_contribution=15, max_count_at_test_duration=10, flag_threshold=2, flag_message="Pasting detected {value} time(s)"),
    MetricRule("copy", "code_integrity", "copy_count", max_contribution=5, max_count_at_test_duration=10, flag_threshold=3, flag_message="Copying detected {value} time(s)"),
    MetricRule("multiple_faces", "identity", "multiple_faces_count", max_contribution=25, max_count_at_test_duration=5, flag_threshold=1, flag_message="Multiple faces detected {value} time(s)"),
    MetricRule("no_face", "identity", "no_face_count", max_contribution=15, max_count_at_test_duration=180, flag_threshold=30, flag_message="Candidate missing from camera {value} time(s)"),
    MetricRule("phone_cell", "identity", "phone_cell_count", max_contribution=10, max_count_at_test_duration=5, flag_threshold=1, flag_message="Cell phone detected {value} time(s)"),
    MetricRule("risk_audio", "environment", "risk_audio_count", max_contribution=5, max_count_at_test_duration=10, flag_threshold=3, flag_message="Audio anomaly detected {value} time(s)"),
]

CATEGORY_WEIGHTS = {
    "environment": 0.25,
    "code_integrity": 0.35,
    "identity": 0.25,
    "tooling": 0.15,
}

@dataclass
class RiskResult:
    total_score: float
    risk_level: RiskLevel
    category_scores: Dict[str, float]
    metric_breakdown: Dict[str, Dict[str, Any]]
    flags: list

    def to_dict(self):
        return {
            "total_score": round(self.total_score, 2),
            "risk_percent": round(self.total_score, 2),
            "risk_level": self.risk_level.value,
            "category_scores": {key: round(value, 2) for key, value in self.category_scores.items()},
            "metric_breakdown": self.metric_breakdown,
            "flags": self.flags,
        }


class RiskFactorCalculator:
    def __init__(self, rules: Optional[list] = None, category_weights: Optional[Dict[str, float]] = None):
        self.rules = rules or DEFAULT_RULES
        self.category_weights = category_weights or CATEGORY_WEIGHTS

    def calculate(self, metrics: Dict[str, float], test_duration_minutes: float = 180) -> RiskResult:
        return self.calculate_fixed(metrics, test_duration_minutes)

    def calculate_fixed(self, metrics: Dict[str, float], test_duration_minutes: float = 180) -> RiskResult:
        if test_duration_minutes <= 0:
            raise ValueError("test_duration_minutes must be greater than zero")
        metric_breakdown = {}
        category_raw = {category: 0.0 for category in self.category_weights}
        flags = []
        total_score = 0.0

        for rule in self.rules:
            count_val = metrics.get(rule.count_key, 0) if rule.count_key else 0
            volume_val = metrics.get(rule.volume_key, 0) if rule.volume_key else 0
            max_count = max(rule.max_count_at_test_duration * test_duration_minutes / 180, 1)
            count_score = (count_val / max_count) * rule.max_contribution
            volume_score = volume_val * rule.per_unit_weight
            score = min(count_score + volume_score, rule.max_contribution)
            metric_breakdown[rule.name] = {"count": count_val, "volume": volume_val, "score": round(score, 2), "max_possible": rule.max_contribution}
            category_raw[rule.category] = category_raw.get(rule.category, 0.0) + score
            total_score += score
            check_val = count_val if rule.count_key else volume_val
            if rule.flag_threshold is not None and check_val >= rule.flag_threshold and rule.flag_message:
                flags.append(rule.flag_message.format(value=check_val))

        total_score = min(total_score, 100.0)
        return RiskResult(total_score, self._bucket(total_score), category_raw, metric_breakdown, flags)

    def _calculate_category_normalized(self, metrics: Dict[str, float]) -> RiskResult:
        metric_breakdown = {}
        category_raw = {category: 0.0 for category in self.category_weights}
        category_max = {category: 0.0 for category in self.category_weights}
        flags = []

        for rule in self.rules:
            count_val = metrics.get(rule.count_key, 0) if rule.count_key else 0
            volume_val = metrics.get(rule.volume_key, 0) if rule.volume_key else 0
            score = min((count_val * rule.per_count_weight) + (volume_val * rule.per_unit_weight), rule.max_contribution)
            metric_breakdown[rule.name] = {"count": count_val, "volume": volume_val, "score": round(score, 2), "max_possible": rule.max_contribution}
            category_raw[rule.category] = category_raw.get(rule.category, 0.0) + score
            category_max[rule.category] = category_max.get(rule.category, 0.0) + rule.max_contribution
            check_val = count_val if rule.count_key else volume_val
            if rule.flag_threshold is not None and check_val >= rule.flag_threshold and rule.flag_message:
                flags.append(rule.flag_message.format(value=check_val))

        category_scores = {}
        total_score = 0.0
        for category, weight in self.category_weights.items():
            raw = category_raw.get(category, 0.0)
            max_possible = category_max.get(category, 1.0) or 1.0
            normalized = min(100.0, (raw / max_possible) * 100.0)
            category_scores[category] = normalized
            total_score += normalized * weight

        return RiskResult(total_score, self._bucket(total_score), category_scores, metric_breakdown, flags)

    @staticmethod
    def _bucket(score: float) -> RiskLevel:
        if score < 20:
            return RiskLevel.LOW
        if score < 45:
            return RiskLevel.MEDIUM
        if score < 70:
            return RiskLevel.HIGH
        return RiskLevel.CRITICAL


if __name__ == "__main__":
    sample_metrics = {
        "fullscreen_exit_count": 2,
        "paste_count": 3,
        "copy_count": 1,
        "multiple_faces_count": 2,
        "no_face_count": 45,
        "window_blur_count": 7,
        "phone_cell_count": 2,
        "risk_audio_count": 1,
    }

    calculator = RiskFactorCalculator()
    print(json.dumps(calculator.calculate(sample_metrics).to_dict(), indent=2))
    print(json.dumps(calculator.calculate_fixed(sample_metrics).to_dict(), indent=2))
