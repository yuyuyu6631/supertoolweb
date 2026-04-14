from datetime import date
from typing import Any

from pydantic import BaseModel, Field


class AccessFlags(BaseModel):
    needsVpn: bool | None = None
    cnLang: bool | None = None
    cnPayment: bool | None = None


class ScenarioRecommendation(BaseModel):
    audience: str
    task: str
    summary: str


class ReviewPreview(BaseModel):
    sourceType: str
    title: str
    body: str
    rating: float | None = None


class ToolSummary(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    score: float
    summary: str
    tags: list[str]
    officialUrl: str
    logoPath: str | None = None
    logoStatus: str | None = None
    logoSource: str | None = None
    status: str
    featured: bool
    createdAt: date
    price: str = ""
    reviewCount: int = 0
    accessFlags: AccessFlags | None = None
    pricingType: str = "unknown"
    priceMinCny: int | None = None
    priceMaxCny: int | None = None
    freeAllowanceText: str = ""


class ToolDetail(ToolSummary):
    description: str
    editorComment: str
    developer: str = ""
    country: str = ""
    city: str = ""
    price: str = ""
    platforms: str = ""
    vpnRequired: str = ""
    targetAudience: list[str] = Field(default_factory=list)
    abilities: list[str] = Field(default_factory=list)
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    pitfalls: list[str] = Field(default_factory=list)
    scenarios: list[str] = Field(default_factory=list)
    scenarioRecommendations: list[ScenarioRecommendation] = Field(default_factory=list)
    reviewPreview: list[ReviewPreview] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    lastVerifiedAt: date


class ImportPreviewValidationStats(BaseModel):
    totalRows: int
    sampleRows: int
    importReadyRows: int
    urlReachableRows: int
    urlRestrictedRows: int
    urlErrorRows: int
    highRiskLogoRows: int
    missingRequiredFieldRows: int


class ImportPreviewValidationItem(BaseModel):
    rowNumber: int
    slug: str
    name: str
    category: str
    summary: str
    officialUrl: str
    logoPath: str | None = None
    finalUrl: str | None = None
    urlStatusCode: int | None = None
    urlCheckStatus: str
    urlReachable: bool
    urlError: str | None = None
    logoRef: str
    logoStatus: str
    logoRiskLevel: str
    logoRiskReasons: list[str]
    developer: str
    country: str
    city: str
    price: str
    platforms: str
    vpnRequired: str
    detailPage: str
    parentRecord: str
    homepageScreenshot: str
    requiredFieldIssues: list[str]
    warnings: list[str]
    importReady: bool


class ImportPreviewValidationReport(BaseModel):
    generatedAt: str
    workbookPath: str
    sheetTitle: str
    sheetHeaders: list[str]
    stats: ImportPreviewValidationStats
    sourceSummary: dict[str, Any]
    items: list[ImportPreviewValidationItem]
