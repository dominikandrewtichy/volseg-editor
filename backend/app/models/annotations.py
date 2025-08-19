from typing import List, Literal

from pydantic import BaseModel, HttpUrl


class Annotation(BaseModel):
    type: str


class PDBAnnotation(Annotation):
    type: Literal["pdb"]
    id: str


class AFDBAnnotation(Annotation):
    type: Literal["afdb"]
    id: str


class MVSAnnotation(Annotation):
    type: Literal["mvs"]
    url: HttpUrl


SegmentAnnotationItem = PDBAnnotation | AFDBAnnotation | MVSAnnotation


class SegmentAnnotation(BaseModel):
    segment_id: str
    annotations: List[SegmentAnnotationItem]


class Entry(BaseModel):
    entry_id: str
    segment_annotations: List[SegmentAnnotation]
