import random
import uuid
from datetime import datetime

from faker.providers import BaseProvider


class CellimFakerProvider(BaseProvider):
    """
    Custom provider for CELLIM domain-specific fake data.
    """

    # Cell types and structures relevant to cell imaging
    cell_types = [
        "Fibroblast",
        "Macrophage",
        "Neuron",
        "Epithelial",
        "Endothelial",
        "T-Cell",
        "B-Cell",
        "Stem Cell",
        "Osteoblast",
        "Chondrocyte",
        "HeLa",
        "CHO",
        "HEK293",
        "MCF-7",
        "U2OS",
        "A549",
        "PC-12",
    ]

    organelles = [
        "Mitochondria",
        "Nucleus",
        "Golgi Apparatus",
        "Endoplasmic Reticulum",
        "Lysosome",
        "Peroxisome",
        "Centrosome",
        "Vacuole",
        "Chloroplast",
        "Ribosome",
        "Nuclear Membrane",
        "Cell Membrane",
        "Cytoskeleton",
    ]

    cellular_processes = [
        "Endocytosis",
        "Exocytosis",
        "Mitosis",
        "Meiosis",
        "Apoptosis",
        "Autophagy",
        "Phagocytosis",
        "Transcription",
        "Translation",
        "Cell Signaling",
        "Cell Migration",
        "Cell Differentiation",
        "Protein Folding",
        "DNA Replication",
        "Cell Respiration",
    ]

    imaging_techniques = [
        "Confocal Microscopy",
        "Super-Resolution Microscopy",
        "Two-Photon Microscopy",
        "Light-Sheet Microscopy",
        "TIRF Microscopy",
        "STORM",
        "PALM",
        "STED",
        "SIM",
        "Fluorescence Microscopy",
        "Phase Contrast",
        "DIC",
        "Electron Microscopy",
        "Cryo-EM",
        "Atomic Force Microscopy",
    ]

    fluorescent_markers = [
        "GFP",
        "RFP",
        "YFP",
        "mCherry",
        "DAPI",
        "Hoechst",
        "Alexa Fluor",
        "Cy3",
        "Cy5",
        "FITC",
        "TRITC",
        "Phalloidin",
        "DiI",
        "Calcein",
        "Fluo-4",
        "MitoTracker",
        "LysoTracker",
        "LifeAct",
    ]

    proteins = [
        "Actin",
        "Tubulin",
        "Collagen",
        "Myosin",
        "Keratin",
        "Lamin",
        "Clathrin",
        "Integrin",
        "Cadherin",
        "TP53",
        "BRCA1",
        "EGFR",
        "MAP2",
        "Rab5",
        "Rab7",
        "LAMP1",
        "EEA1",
        "Calnexin",
        "TOMM20",
    ]

    drugs_treatments = [
        "Nocodazole",
        "Latrunculin",
        "Cytochalasin D",
        "Brefeldin A",
        "Rapamycin",
        "Bafilomycin",
        "Staurosporine",
        "Taxol",
        "Thapsigargin",
        "Tunicamycin",
        "Cycloheximide",
        "Actinomycin D",
        "TNF-alpha",
        "TGF-beta",
        "EGF",
        "FGF",
        "IGF",
        "VEGF",
        "Wnt3a",
    ]

    sample_types = [
        "3D Culture",
        "Organoid",
        "Spheroid",
        "Tissue Section",
        "Single Cell",
        "Monolayer",
        "Fixed Sample",
        "Live Cell",
        "Explant",
        "Primary Culture",
        "In Vivo",
        "Ex Vivo",
        "Immunostained",
        "Cell Extract",
        "Whole Mount",
    ]

    experimental_conditions = [
        "High Glucose",
        "Low Glucose",
        "Hypoxia",
        "Hyperoxia",
        "Acidic pH",
        "Alkaline pH",
        "High Density",
        "Low Density",
        "Serum Starvation",
        "Growth Factor Depletion",
        "Heat Shock",
        "Cold Shock",
        "Oxidative Stress",
        "ER Stress",
        "DNA Damage",
    ]

    organisms = [
        "Human",
        "Mouse",
        "Rat",
        "Zebrafish",
        "Drosophila",
        "C. elegans",
        "Arabidopsis",
        "Xenopus",
        "Yeast",
        "E. coli",
        "A. thaliana",
        "D. discoideum",
        "S. cerevisiae",
    ]

    # PDB protein structures commonly used in molecular visualization
    pdb_structures = [
        "1tqn",
        "4hhb",
        "1ubq",
        "1crn",
        "1cbs",
        "1bna",
        "1lyd",
        "3pqr",
        "2m6c",
        "1igt",
        "1gfl",
        "4ake",
        "1brs",
        "2lyz",
        "1dna",
        "2hbs",
        "3eql",
        "1bl8",
        "2qol",
        "5g24",
        "1zed",
        "1ema",
        "6vxx",
        "7kr0",
    ]

    # Visualization styles for molecular representations
    visualization_styles = [
        "cartoon",
        "ball-and-stick",
        "licorice",
        "surface",
        "ribbon",
        "tube",
        "sphere",
        "point",
        "line",
        "backbone",
        "trace",
    ]

    # Coloring schemes for molecular visualization
    coloring_schemes = [
        "chain-id",
        "element-symbol",
        "residue-name",
        "residue-type",
        "sequence-id",
        "secondary-structure",
        "molecule-type",
        "hydrophobicity",
        "temperature-factor",
        "uniform",
    ]

    # Methods to generate domain-specific content
    def cell_type(self):
        """Return a random cell type."""
        return self.random_element(self.cell_types)

    def organelle(self):
        """Return a random cellular organelle."""
        return self.random_element(self.organelles)

    def cellular_process(self):
        """Return a random cellular process."""
        return self.random_element(self.cellular_processes)

    def imaging_technique(self):
        """Return a random imaging technique."""
        return self.random_element(self.imaging_techniques)

    def fluorescent_marker(self):
        """Return a random fluorescent marker."""
        return self.random_element(self.fluorescent_markers)

    def protein(self):
        """Return a random protein."""
        return self.random_element(self.proteins)

    def drug_treatment(self):
        """Return a random drug or treatment."""
        return self.random_element(self.drugs_treatments)

    def sample_type(self):
        """Return a random sample type."""
        return self.random_element(self.sample_types)

    def experimental_condition(self):
        """Return a random experimental condition."""
        return self.random_element(self.experimental_conditions)

    def organism(self):
        """Return a random organism."""
        return self.random_element(self.organisms)

    def pdb_structure(self):
        """Return a random PDB structure ID."""
        return self.random_element(self.pdb_structures)

    def visualization_style(self):
        """Return a random molecular visualization style."""
        return self.random_element(self.visualization_styles)

    def coloring_scheme(self):
        """Return a random molecular coloring scheme."""
        return self.random_element(self.coloring_schemes)

    # Custom methods for generating domain-specific entries
    def entry_name(self):
        """Generate a realistic name for a CELLIM entry."""
        patterns = [
            "{organism} {cell_type} {cellular_process}",
            "{imaging_technique} of {protein} in {cell_type} cells",
            "{fluorescent_marker}-labeled {organelle} in {cell_type}",
            "{drug_treatment} effects on {cell_type} {organelle}",
            "{sample_type} imaging of {organism} {cell_type}",
            "{protein} dynamics during {cellular_process}",
            "{experimental_condition} induced {cellular_process}",
            "{imaging_technique} study of {fluorescent_marker} in {sample_type}",
            "Time-lapse imaging of {cellular_process} in {cell_type}",
            "{protein} localization in {organelle} using {imaging_technique}",
        ]

        pattern = self.random_element(patterns)
        return pattern.format(
            organism=self.organism(),
            cell_type=self.cell_type(),
            cellular_process=self.cellular_process(),
            imaging_technique=self.imaging_technique(),
            protein=self.protein(),
            fluorescent_marker=self.fluorescent_marker(),
            organelle=self.organelle(),
            drug_treatment=self.drug_treatment(),
            sample_type=self.sample_type(),
            experimental_condition=self.experimental_condition(),
        )

    def entry_description(self):
        """Generate a realistic description for a CELLIM entry."""
        parts = []

        # Introduction
        intro_templates = [
            "This dataset contains {imaging_technique} images of {organism} {cell_type} cells.",
            "A collection of {sample_type} images showing {protein} distribution during {cellular_process}.",
            "Time-series data of {fluorescent_marker}-labeled {organelle} in {cell_type} cells.",
        ]
        parts.append(
            self.random_element(intro_templates).format(
                imaging_technique=self.imaging_technique(),
                organism=self.organism(),
                cell_type=self.cell_type(),
                sample_type=self.sample_type(),
                protein=self.protein(),
                cellular_process=self.cellular_process(),
                fluorescent_marker=self.fluorescent_marker(),
                organelle=self.organelle(),
            )
        )

        # Methodology
        method_templates = [
            "Cells were fixed and stained with {fluorescent_marker} to visualize {organelle}.",
            "Live cell imaging was performed using {imaging_technique} with {fluorescent_marker} as a marker.",
            "Samples were treated with {drug_treatment} to induce {cellular_process}.",
            "{sample_type} were cultured under {experimental_condition} conditions for 24 hours before imaging.",
        ]
        parts.append(
            self.random_element(method_templates).format(
                fluorescent_marker=self.fluorescent_marker(),
                organelle=self.organelle(),
                imaging_technique=self.imaging_technique(),
                drug_treatment=self.drug_treatment(),
                cellular_process=self.cellular_process(),
                sample_type=self.sample_type(),
                experimental_condition=self.experimental_condition(),
            )
        )

        # Results or observations
        result_templates = [
            "The images reveal distinct localization patterns of {protein} in response to {drug_treatment}.",
            "We observed dynamic changes in {organelle} morphology during {cellular_process}.",
            "The data shows colocalization between {protein} and {organelle} markers.",
            "Significant differences were detected between control and {experimental_condition} treated samples.",
        ]
        parts.append(
            self.random_element(result_templates).format(
                protein=self.protein(),
                drug_treatment=self.drug_treatment(),
                organelle=self.organelle(),
                cellular_process=self.cellular_process(),
                experimental_condition=self.experimental_condition(),
            )
        )

        # Conclusion or implications
        conclusion_templates = [
            "These results suggest a role for {protein} in regulating {cellular_process}.",
            "The imaging data provides new insights into {organelle} dynamics in {cell_type} cells.",
            "This dataset serves as a valuable resource for studying {cellular_process} in {organism} cells.",
            "Further analysis may reveal additional features of {protein} behavior under {experimental_condition}.",
        ]
        parts.append(
            self.random_element(conclusion_templates).format(
                protein=self.protein(),
                cellular_process=self.cellular_process(),
                organelle=self.organelle(),
                cell_type=self.cell_type(),
                organism=self.organism(),
                experimental_condition=self.experimental_condition(),
            )
        )

        return "\n\n".join(parts)

    def view_name(self):
        """Generate a name for a view within an entry."""
        patterns = [
            "{organelle} view",
            "{protein} distribution",
            "{cell_type} morphology",
            "Time point {time_point}",
            "Z-stack {z_number}",
            "{fluorescent_marker} channel",
            "{imaging_technique} projection",
            "Region of interest {roi_number}",
            "{experimental_condition} condition",
            "Control vs {drug_treatment}",
            "{view_direction} view",
            "Surface rendering of {organelle}",
            "{protein} 3D reconstruction",
            "{visualization_style} view of {pdb_structure}",
            "{coloring_scheme} colored {protein} structure",
        ]

        pattern = self.random_element(patterns)
        return pattern.format(
            organelle=self.organelle(),
            protein=self.protein(),
            cell_type=self.cell_type(),
            time_point=random.randint(1, 24),
            z_number=random.randint(1, 50),
            fluorescent_marker=self.fluorescent_marker(),
            imaging_technique=self.imaging_technique(),
            roi_number=random.randint(1, 10),
            experimental_condition=self.experimental_condition(),
            drug_treatment=self.drug_treatment(),
            view_direction=self.random_element(
                ["Top", "Side", "Bottom", "Orthogonal", "Maximum intensity"]
            ),
            visualization_style=self.visualization_style(),
            pdb_structure=self.pdb_structure(),
            coloring_scheme=self.coloring_scheme(),
        )

    def view_description(self):
        """Generate a description for a view within an entry."""
        templates = [
            "This view shows {organelle} distribution visualized with {fluorescent_marker}.",
            "3D reconstruction of {protein} localization relative to {organelle}.",
            "Time point {time_point} showing changes in {cellular_process}.",
            "Z-section {z_number} highlighting {protein} in the {organelle}.",
            "Segmentation of {cell_type} cells with {fluorescent_marker}-labeled {organelle}.",
            "Colocalization analysis between {protein1} and {protein2}.",
            "Comparison of {organelle} before and after {drug_treatment} treatment.",
            "Surface rendering of {organelle} during {cellular_process}.",
            "Slice view showing internal structure of {sample_type}.",
            "Channel {channel_number}: {fluorescent_marker} staining of {protein}.",
            "{visualization_style} representation of {pdb_structure} colored by {coloring_scheme}.",
            "Molecular visualization of {protein} with {drug_treatment} binding pocket highlighted.",
        ]

        template = self.random_element(templates)
        return template.format(
            organelle=self.organelle(),
            fluorescent_marker=self.fluorescent_marker(),
            protein=self.protein(),
            protein1=self.protein(),
            protein2=self.protein(),
            time_point=random.randint(1, 24),
            z_number=random.randint(1, 50),
            cellular_process=self.cellular_process(),
            cell_type=self.cell_type(),
            drug_treatment=self.drug_treatment(),
            sample_type=self.sample_type(),
            channel_number=random.randint(1, 4),
            visualization_style=self.visualization_style(),
            pdb_structure=self.pdb_structure(),
            coloring_scheme=self.coloring_scheme(),
        )

    def view_snapshot(self):
        """Generate a realistic snapshot data structure for molecular visualization."""
        # Create a unique ID for this snapshot
        snapshot_id = str(uuid.uuid4()).replace("-", "")
        current_id = str(uuid.uuid4()).replace("-", "")

        # Generate current timestamp in milliseconds
        timestamp = int(datetime.now().timestamp() * 1000)

        # Select a random PDB structure for this snapshot
        pdb_id = self.pdb_structure()

        # Generate random camera position
        camera_position = [
            random.uniform(-50, 50),  # x
            random.uniform(-50, 50),  # y
            random.uniform(80, 100),  # z
        ]

        # Generate random camera target
        camera_target = [
            random.uniform(-20, 20),  # x
            random.uniform(-20, 20),  # y
            random.uniform(-20, 20),  # z
        ]

        # Choose a visualization style and coloring scheme
        vis_style = self.visualization_style()
        coloring = self.coloring_scheme()

        # Basic snapshot structure (minimal version for database storage)
        snapshot = {
            "timestamp": 1744127909301,
            "version": "4.12.1",
            "current": "TIxHpSFvcTRRoSnSEAJV5Q",
            "playback": {"isPlaying": False, "nextSnapshotDelayInMs": 1500},
            "entries": [
                {
                    "timestamp": 1744127909297,
                    "snapshot": {
                        "id": "TIxHpSFvcTRRoSnSEAJV5Q",
                        "data": {
                            "tree": {
                                "transforms": [
                                    {
                                        "parent": "-=root=-",
                                        "transformer": "build-in.root",
                                        "params": {},
                                        "ref": "-=root=-",
                                        "version": "NMWeSCxsPvw9eG3LSZ9sQQ",
                                    },
                                    {
                                        "parent": "-=root=-",
                                        "transformer": "ms-plugin.download",
                                        "params": {
                                            "url": {
                                                "kind": "url",
                                                "id": "7fllQmagJ5dCbOG7cXhj8w",
                                                # "id": str(uuid.uuid4()).replace("-", ""),
                                                "url": f"https://www.ebi.ac.uk/pdbe/entry-files/download/{pdb_id}.bcif",
                                            },
                                            "label": "PDBe: 1tqn (updated cif)",
                                            "isBinary": True,
                                        },
                                        "state": {"isGhost": True},
                                        "ref": "0lqHYbdYgN2fhmH1IDXIMw",
                                        "version": "UsGRpUD0e4e61HTAYe74Bw",
                                    },
                                    {
                                        "parent": "0lqHYbdYgN2fhmH1IDXIMw",
                                        "transformer": "ms-plugin.parse-cif",
                                        "params": {},
                                        "state": {"isGhost": True},
                                        "ref": "NlFk1JsFtqo6zgUV6-hLFg",
                                        "version": "4KCiHrEnuwynAeM2Bo2bng",
                                    },
                                    {
                                        "parent": "NlFk1JsFtqo6zgUV6-hLFg",
                                        "transformer": "ms-plugin.trajectory-from-mmcif",
                                        "params": {},
                                        "ref": "UCDGF_X9nBa4rfVT77hlkQ",
                                        "version": "BXMe7-To88_6w579wrS11w",
                                    },
                                    {
                                        "parent": "UCDGF_X9nBa4rfVT77hlkQ",
                                        "transformer": "ms-plugin.model-from-trajectory",
                                        "params": {"modelIndex": 0},
                                        "ref": "tgoAZtZDyMDmusVGNczLSw",
                                        "version": "8mFi566Fkz-9klqfmtp-yQ",
                                    },
                                    {
                                        "parent": "tgoAZtZDyMDmusVGNczLSw",
                                        "transformer": "ms-plugin.custom-model-properties",
                                        "params": {
                                            "autoAttach": ["sifts_sequence_mapping"],
                                            "properties": {
                                                "asym_id_offset": {
                                                    "value": {"auth": 0, "label": 0}
                                                },
                                                "index": {"value": 0},
                                                "max_index": {"value": 0},
                                                "sifts_sequence_mapping": {},
                                                "pdbe_structure_quality_report": {
                                                    "serverUrl": "https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/"
                                                },
                                                "rcsb_validation_report": {
                                                    "source": {
                                                        "name": "server",
                                                        "params": {
                                                            "baseUrl": "https://files.rcsb.org/pub/pdb/validation_reports"
                                                        },
                                                    }
                                                },
                                                "mvs-is-mvs-model": {"isMvs": False},
                                                "mvs-annotations": {"annotations": []},
                                            },
                                        },
                                        "ref": "0FJ0vvTL-7B2hnHJJFXwZw",
                                        "version": "5mp0zRneFd2wNKyJnrpYdA",
                                    },
                                    {
                                        "parent": "0FJ0vvTL-7B2hnHJJFXwZw",
                                        "transformer": "ms-plugin.structure-from-model",
                                        "params": {
                                            "type": {
                                                "name": "assembly",
                                                "params": {"id": "1", "dynamicBonds": False},
                                            }
                                        },
                                        "ref": "hzn6abgSHC4fO2YG9TLJ2w",
                                        "version": "jU_6EFNRuyp31O2caLuGMQ",
                                    },
                                    {
                                        "parent": "hzn6abgSHC4fO2YG9TLJ2w",
                                        "transformer": "ms-plugin.custom-structure-properties",
                                        "params": {
                                            "autoAttach": [],
                                            "properties": {
                                                "index": {"value": 0},
                                                "max_index": {"value": 0},
                                                "molstar_accessible_surface_area": {
                                                    "numberOfSpherePoints": 92,
                                                    "probeSize": 1.4,
                                                    "nonPolymer": False,
                                                    "traceOnly": False,
                                                },
                                                "molstar_computed_interactions": {
                                                    "providers": {
                                                        "ionic": {"name": "off", "params": {}},
                                                        "pi-stacking": {
                                                            "name": "on",
                                                            "params": {
                                                                "distanceMax": 5.5,
                                                                "offsetMax": 2,
                                                                "angleDevMax": 30,
                                                            },
                                                        },
                                                        "cation-pi": {
                                                            "name": "on",
                                                            "params": {
                                                                "distanceMax": 6,
                                                                "offsetMax": 2,
                                                            },
                                                        },
                                                        "halogen-bonds": {
                                                            "name": "on",
                                                            "params": {
                                                                "distanceMax": 4,
                                                                "angleMax": 30,
                                                            },
                                                        },
                                                        "hydrogen-bonds": {
                                                            "name": "on",
                                                            "params": {
                                                                "distanceMax": 3.5,
                                                                "backbone": True,
                                                                "accAngleDevMax": 45,
                                                                "ignoreHydrogens": False,
                                                                "donAngleDevMax": 45,
                                                                "accOutOfPlaneAngleMax": 90,
                                                                "donOutOfPlaneAngleMax": 45,
                                                                "water": False,
                                                                "sulfurDistanceMax": 4.1,
                                                            },
                                                        },
                                                        "weak-hydrogen-bonds": {
                                                            "name": "off",
                                                            "params": {},
                                                        },
                                                        "hydrophobic": {
                                                            "name": "off",
                                                            "params": {},
                                                        },
                                                        "metal-coordination": {
                                                            "name": "on",
                                                            "params": {"distanceMax": 3},
                                                        },
                                                    },
                                                    "contacts": {"lineOfSightDistFactor": 1},
                                                },
                                                "molstar_computed_secondary_structure": {
                                                    "type": {"name": "auto", "params": {}}
                                                },
                                                "molstar_computed_valence_model": {
                                                    "assignCharge": "auto",
                                                    "assignH": "auto",
                                                },
                                                "molstar_struct_symmetry": {
                                                    "serverType": "rcsb",
                                                    "serverUrl": "https://data.rcsb.org/graphql",
                                                    "symmetryIndex": 0,
                                                },
                                                "anvil_computed_membrane_orientation": {
                                                    "numberOfSpherePoints": 175,
                                                    "stepSize": 1,
                                                    "minThickness": 20,
                                                    "maxThickness": 40,
                                                    "asaCutoff": 40,
                                                    "adjust": 14,
                                                    "tmdetDefinition": False,
                                                },
                                                "mvs-custom-tooltips": {"tooltips": []},
                                                "mvs-annotation-tooltips": {"tooltips": []},
                                            },
                                        },
                                        "ref": "mkwoY36hKcAY23WJhVjGRg",
                                        "version": "ZLlpjiEHz6IwNW9ivaoshA",
                                    },
                                    {
                                        "parent": "mkwoY36hKcAY23WJhVjGRg",
                                        "transformer": "ms-plugin.structure-component",
                                        "params": {
                                            "type": {"name": "static", "params": "polymer"},
                                            "nullIfEmpty": True,
                                            "label": "",
                                        },
                                        "tags": ["structure-component-static-polymer"],
                                        "ref": "YkrPIFOgGPFo4XoX5IsHZA",
                                        "version": "aUWgMK1-zkSlaH239QVr7w",
                                    },
                                    {
                                        "parent": "YkrPIFOgGPFo4XoX5IsHZA",
                                        "transformer": "ms-plugin.structure-representation-3d",
                                        "params": {
                                            "type": {
                                                "name": "cartoon",
                                                "params": {
                                                    "alpha": 1,
                                                    "quality": "auto",
                                                    "material": {
                                                        "metalness": 0,
                                                        "roughness": 1,
                                                        "bumpiness": 0,
                                                    },
                                                    "clip": {"variant": "pixel", "objects": []},
                                                    "emissive": 0,
                                                    "density": 0.1,
                                                    "instanceGranularity": False,
                                                    "lod": [0, 0, 0],
                                                    "cellSize": 200,
                                                    "batchSize": 2000,
                                                    "doubleSided": False,
                                                    "flipSided": False,
                                                    "flatShaded": False,
                                                    "ignoreLight": False,
                                                    "celShaded": False,
                                                    "xrayShaded": False,
                                                    "transparentBackfaces": "off",
                                                    "bumpFrequency": 2,
                                                    "bumpAmplitude": 1,
                                                    "unitKinds": ["atomic", "spheres"],
                                                    "includeParent": False,
                                                    "sizeFactor": 0.2,
                                                    "aspectRatio": 5,
                                                    "arrowFactor": 1.5,
                                                    "tubularHelices": False,
                                                    "roundCap": False,
                                                    "helixProfile": "elliptical",
                                                    "nucleicProfile": "square",
                                                    "detail": 0,
                                                    "linearSegments": 8,
                                                    "radialSegments": 16,
                                                    "thicknessFactor": 1,
                                                    "sizeAspectRatio": 1,
                                                    "solidInterior": True,
                                                    "colorMode": "default",
                                                    "tryUseImpostor": True,
                                                    "clipPrimitive": False,
                                                    "approximate": False,
                                                    "alphaThickness": 0,
                                                    "lodLevels": [],
                                                    "visuals": ["polymer-trace", "polymer-gap"],
                                                },
                                            },
                                            "colorTheme": {
                                                "name": "chain-id",
                                                "params": {
                                                    "asymId": "auth",
                                                    "palette": {
                                                        "name": "colors",
                                                        "params": {
                                                            "list": {
                                                                "kind": "set",
                                                                "colors": [
                                                                    1810039,
                                                                    14245634,
                                                                    7696563,
                                                                    15149450,
                                                                    6727198,
                                                                    15117058,
                                                                    10909213,
                                                                    6710886,
                                                                    14948892,
                                                                    3636920,
                                                                    5091146,
                                                                    9981603,
                                                                    16744192,
                                                                    16777011,
                                                                    10901032,
                                                                    16220607,
                                                                    10066329,
                                                                    6734501,
                                                                    16551266,
                                                                    9281739,
                                                                    15174339,
                                                                    10934356,
                                                                    16767279,
                                                                    15058068,
                                                                    11776947,
                                                                ],
                                                            }
                                                        },
                                                    },
                                                },
                                            },
                                            "sizeTheme": {
                                                "name": "uniform",
                                                "params": {"value": 1},
                                            },
                                        },
                                        "tags": ["polymer"],
                                        "ref": "FQqKZNjStOXUal2m7B2VfA",
                                        "version": "RtVBwOTcr8uVj9NyCGrVRQ",
                                    },
                                    {
                                        "parent": "mkwoY36hKcAY23WJhVjGRg",
                                        "transformer": "ms-plugin.structure-component",
                                        "params": {
                                            "type": {"name": "static", "params": "ligand"},
                                            "nullIfEmpty": True,
                                            "label": "",
                                        },
                                        "tags": ["structure-component-static-ligand"],
                                        "ref": "UUiVF-JNDQGasbEfLLXwmA",
                                        "version": "OIc5lCAWwDmRjgM0BeUYkg",
                                    },
                                    {
                                        "parent": "UUiVF-JNDQGasbEfLLXwmA",
                                        "transformer": "ms-plugin.structure-representation-3d",
                                        "params": {
                                            "type": {
                                                "name": "ball-and-stick",
                                                "params": {
                                                    "alpha": 1,
                                                    "quality": "auto",
                                                    "material": {
                                                        "metalness": 0,
                                                        "roughness": 1,
                                                        "bumpiness": 0,
                                                    },
                                                    "clip": {"variant": "pixel", "objects": []},
                                                    "emissive": 0,
                                                    "density": 0.1,
                                                    "instanceGranularity": False,
                                                    "lod": [0, 0, 0],
                                                    "cellSize": 200,
                                                    "batchSize": 2000,
                                                    "doubleSided": False,
                                                    "flipSided": False,
                                                    "flatShaded": False,
                                                    "ignoreLight": False,
                                                    "celShaded": False,
                                                    "xrayShaded": False,
                                                    "transparentBackfaces": "off",
                                                    "bumpFrequency": 0,
                                                    "bumpAmplitude": 1,
                                                    "unitKinds": ["atomic"],
                                                    "includeParent": False,
                                                    "sizeFactor": 0.15,
                                                    "solidInterior": True,
                                                    "clipPrimitive": False,
                                                    "approximate": False,
                                                    "alphaThickness": 0,
                                                    "lodLevels": [],
                                                    "detail": 0,
                                                    "ignoreHydrogens": False,
                                                    "ignoreHydrogensVariant": "all",
                                                    "traceOnly": False,
                                                    "tryUseImpostor": True,
                                                    "stride": 1,
                                                    "sizeAspectRatio": 0.6666666666666666,
                                                    "colorMode": "default",
                                                    "linkScale": 0.45,
                                                    "linkSpacing": 1,
                                                    "linkCap": False,
                                                    "aromaticScale": 0.3,
                                                    "aromaticSpacing": 1.5,
                                                    "aromaticDashCount": 2,
                                                    "dashCount": 4,
                                                    "dashScale": 0.8,
                                                    "dashCap": True,
                                                    "stubCap": True,
                                                    "radialSegments": 16,
                                                    "includeTypes": [
                                                        "covalent",
                                                        "metal-coordination",
                                                        "hydrogen-bond",
                                                        "disulfide",
                                                        "aromatic",
                                                        "computed",
                                                    ],
                                                    "excludeTypes": [],
                                                    "aromaticBonds": True,
                                                    "multipleBonds": "symmetric",
                                                    "adjustCylinderLength": False,
                                                    "visuals": [
                                                        "element-sphere",
                                                        "intra-bond",
                                                        "inter-bond",
                                                    ],
                                                },
                                            },
                                            "colorTheme": {
                                                "name": "element-symbol",
                                                "params": {
                                                    "carbonColor": {
                                                        "name": "chain-id",
                                                        "params": {
                                                            "asymId": "auth",
                                                            "palette": {
                                                                "name": "colors",
                                                                "params": {
                                                                    "list": {
                                                                        "kind": "set",
                                                                        "colors": [
                                                                            1810039,
                                                                            14245634,
                                                                            7696563,
                                                                            15149450,
                                                                            6727198,
                                                                            15117058,
                                                                            10909213,
                                                                            6710886,
                                                                            14948892,
                                                                            3636920,
                                                                            5091146,
                                                                            9981603,
                                                                            16744192,
                                                                            16777011,
                                                                            10901032,
                                                                            16220607,
                                                                            10066329,
                                                                            6734501,
                                                                            16551266,
                                                                            9281739,
                                                                            15174339,
                                                                            10934356,
                                                                            16767279,
                                                                            15058068,
                                                                            11776947,
                                                                        ],
                                                                    }
                                                                },
                                                            },
                                                        },
                                                    },
                                                    "saturation": 0,
                                                    "lightness": 0.2,
                                                    "colors": {"name": "default", "params": {}},
                                                },
                                            },
                                            "sizeTheme": {
                                                "name": "physical",
                                                "params": {"scale": 1},
                                            },
                                        },
                                        "tags": ["ligand"],
                                        "ref": "MPla8dVxxnm7NHubNPn19g",
                                        "version": "5kKh_D4AocfeVGSpIjkq0g",
                                    },
                                    {
                                        "parent": "mkwoY36hKcAY23WJhVjGRg",
                                        "transformer": "ms-plugin.structure-component",
                                        "params": {
                                            "type": {"name": "static", "params": "water"},
                                            "nullIfEmpty": True,
                                            "label": "",
                                        },
                                        "tags": ["structure-component-static-water"],
                                        "ref": "AFdQ_JhWJeDA9x04xBHeBQ",
                                        "version": "MZvRZD-sxZmdnFUuigqWbQ",
                                    },
                                    {
                                        "parent": "AFdQ_JhWJeDA9x04xBHeBQ",
                                        "transformer": "ms-plugin.structure-representation-3d",
                                        "params": {
                                            "type": {
                                                "name": "ball-and-stick",
                                                "params": {
                                                    "alpha": 0.6,
                                                    "quality": "auto",
                                                    "material": {
                                                        "metalness": 0,
                                                        "roughness": 1,
                                                        "bumpiness": 0,
                                                    },
                                                    "clip": {"variant": "pixel", "objects": []},
                                                    "emissive": 0,
                                                    "density": 0.1,
                                                    "instanceGranularity": False,
                                                    "lod": [0, 0, 0],
                                                    "cellSize": 200,
                                                    "batchSize": 2000,
                                                    "doubleSided": False,
                                                    "flipSided": False,
                                                    "flatShaded": False,
                                                    "ignoreLight": False,
                                                    "celShaded": False,
                                                    "xrayShaded": False,
                                                    "transparentBackfaces": "off",
                                                    "bumpFrequency": 0,
                                                    "bumpAmplitude": 1,
                                                    "unitKinds": ["atomic"],
                                                    "includeParent": False,
                                                    "sizeFactor": 0.15,
                                                    "solidInterior": True,
                                                    "clipPrimitive": False,
                                                    "approximate": False,
                                                    "alphaThickness": 0,
                                                    "lodLevels": [],
                                                    "detail": 0,
                                                    "ignoreHydrogens": False,
                                                    "ignoreHydrogensVariant": "all",
                                                    "traceOnly": False,
                                                    "tryUseImpostor": True,
                                                    "stride": 1,
                                                    "sizeAspectRatio": 0.6666666666666666,
                                                    "colorMode": "default",
                                                    "linkScale": 0.45,
                                                    "linkSpacing": 1,
                                                    "linkCap": False,
                                                    "aromaticScale": 0.3,
                                                    "aromaticSpacing": 1.5,
                                                    "aromaticDashCount": 2,
                                                    "dashCount": 4,
                                                    "dashScale": 0.8,
                                                    "dashCap": True,
                                                    "stubCap": True,
                                                    "radialSegments": 16,
                                                    "includeTypes": [
                                                        "covalent",
                                                        "metal-coordination",
                                                        "hydrogen-bond",
                                                        "disulfide",
                                                        "aromatic",
                                                        "computed",
                                                    ],
                                                    "excludeTypes": [],
                                                    "aromaticBonds": True,
                                                    "multipleBonds": "symmetric",
                                                    "adjustCylinderLength": False,
                                                    "visuals": [
                                                        "element-sphere",
                                                        "intra-bond",
                                                        "inter-bond",
                                                    ],
                                                },
                                            },
                                            "colorTheme": {
                                                "name": "element-symbol",
                                                "params": {
                                                    "carbonColor": {
                                                        "name": "element-symbol",
                                                        "params": {},
                                                    },
                                                    "saturation": 0,
                                                    "lightness": 0.2,
                                                    "colors": {"name": "default", "params": {}},
                                                },
                                            },
                                            "sizeTheme": {
                                                "name": "physical",
                                                "params": {"scale": 1},
                                            },
                                        },
                                        "tags": ["water"],
                                        "ref": "S8OAH64XdPadTJ4mUkOYyA",
                                        "version": "UjbF3gAAoz9lT0rWCr9Hzg",
                                    },
                                    {
                                        "parent": "0FJ0vvTL-7B2hnHJJFXwZw",
                                        "transformer": "ms-plugin.model-unitcell-3d",
                                        "params": {
                                            "alpha": 1,
                                            "quality": "auto",
                                            "material": {
                                                "metalness": 0,
                                                "roughness": 1,
                                                "bumpiness": 0,
                                            },
                                            "clip": {"variant": "pixel", "objects": []},
                                            "emissive": 0,
                                            "density": 0.2,
                                            "instanceGranularity": False,
                                            "lod": [0, 0, 0],
                                            "cellSize": 200,
                                            "batchSize": 2000,
                                            "doubleSided": False,
                                            "flipSided": False,
                                            "flatShaded": False,
                                            "ignoreLight": False,
                                            "celShaded": False,
                                            "xrayShaded": False,
                                            "transparentBackfaces": "off",
                                            "bumpFrequency": 0,
                                            "bumpAmplitude": 1,
                                            "cellColor": 16753920,
                                            "cellScale": 2,
                                            "ref": "model",
                                            "attachment": "corner",
                                        },
                                        "state": {"isHidden": True},
                                        "ref": "zrtzBk43If24tCEkzfDZFg",
                                        "version": "OlFK-AU3os4w-g7TDnzdsg",
                                    },
                                ]
                            }
                        },
                        "animation": {
                            "state": {
                                "params": {"current": "built-in.animate-model-index"},
                                "animationState": "stopped",
                            },
                            "current": {
                                "paramValues": {
                                    "mode": {"name": "loop", "params": {"direction": "forward"}},
                                    "duration": {"name": "fixed", "params": {"durationInS": 5}},
                                },
                                "state": {},
                            },
                        },
                        "camera": {
                            "current": {
                                "mode": "perspective",
                                "fov": 0.7853981633974483,
                                "position": camera_position,
                                "up": [0, 1, 0],
                                "target": camera_target,
                                "radius": random.uniform(30, 50),
                                "radiusMax": random.uniform(80, 100),
                                "fog": 15,
                                "clipFar": True,
                                "minNear": 5,
                                "minFar": 0,
                            },
                            "transitionStyle": "animate",
                            "transitionDurationInMs": 250,
                        },
                        "canvas3dContext": {
                            "props": {
                                "resolutionMode": "auto",
                                "pixelScale": 1,
                                "pickScale": 0.25,
                                "transparency": "wboit",
                            }
                        },
                        "canvas3d": {
                            "props": {
                                "camera": {
                                    "mode": "perspective",
                                    "helper": {
                                        "axes": {
                                            "name": "on",
                                            "params": {
                                                "alpha": 0.51,
                                                "colorX": 16711680,
                                                "colorY": 32768,
                                                "colorZ": 255,
                                                "scale": 0.33,
                                                "location": "bottom-left",
                                                "locationOffsetX": 0,
                                                "locationOffsetY": 0,
                                                "originColor": 8421504,
                                                "radiusScale": 0.075,
                                                "showPlanes": True,
                                                "planeColorXY": 8421504,
                                                "planeColorXZ": 8421504,
                                                "planeColorYZ": 8421504,
                                                "showLabels": False,
                                                "labelX": "X",
                                                "labelY": "Y",
                                                "labelZ": "Z",
                                                "labelColorX": 8421504,
                                                "labelColorY": 8421504,
                                                "labelColorZ": 8421504,
                                                "labelOpacity": 1,
                                                "labelScale": 0.25,
                                            },
                                        }
                                    },
                                    "stereo": {"name": "off", "params": {}},
                                    "fov": 45,
                                    "manualReset": False,
                                },
                                "cameraFog": {"name": "on", "params": {"intensity": 15}},
                                "cameraClipping": {"far": True, "radius": 57, "minNear": 5},
                                "cameraResetDurationMs": 250,
                                "sceneRadiusFactor": 1,
                                "transparentBackground": False,
                                "dpoitIterations": 2,
                                "pickPadding": 3,
                                "userInteractionReleaseMs": 250,
                                "viewport": {"name": "canvas", "params": {}},
                                "postprocessing": {
                                    "occlusion": {
                                        "name": "on",
                                        "params": {
                                            "samples": 32,
                                            "multiScale": {"name": "off", "params": {}},
                                            "radius": 5,
                                            "bias": 0.8,
                                            "blurKernelSize": 15,
                                            "blurDepthBias": 0.5,
                                            "resolutionScale": 1,
                                            "color": 0,
                                            "transparentThreshold": 0.4,
                                        },
                                    },
                                    "shadow": {"name": "off", "params": {}},
                                    "outline": {"name": "off", "params": {}},
                                    "dof": {"name": "off", "params": {}},
                                    "antialiasing": {
                                        "name": "smaa",
                                        "params": {"edgeThreshold": 0.1, "maxSearchSteps": 16},
                                    },
                                    "sharpening": {"name": "off", "params": {}},
                                    "background": {"variant": {"name": "off", "params": {}}},
                                    "bloom": {
                                        "name": "on",
                                        "params": {
                                            "strength": 1,
                                            "radius": 0,
                                            "threshold": 0,
                                            "mode": "emissive",
                                        },
                                    },
                                },
                                "marking": {
                                    "enabled": True,
                                    "highlightEdgeColor": 13119595,
                                    "selectEdgeColor": 51712,
                                    "edgeScale": 1,
                                    "highlightEdgeStrength": 1,
                                    "selectEdgeStrength": 1,
                                    "ghostEdgeStrength": 0.3,
                                    "innerEdgeFactor": 1.5,
                                },
                                "multiSample": {
                                    "mode": "temporal",
                                    "sampleLevel": 2,
                                    "reduceFlicker": True,
                                    "reuseOcclusion": True,
                                },
                                "illumination": {
                                    "enabled": False,
                                    "maxIterations": 5,
                                    "denoise": True,
                                    "denoiseThreshold": [0.15, 1],
                                    "ignoreOutline": True,
                                    "rendersPerFrame": [1, 16],
                                    "targetFps": 30,
                                    "steps": 32,
                                    "firstStepSize": 0.01,
                                    "refineSteps": 4,
                                    "rayDistance": 256,
                                    "thicknessMode": "auto",
                                    "minThickness": 0.5,
                                    "thicknessFactor": 1,
                                    "thickness": 4,
                                    "bounces": 4,
                                    "glow": True,
                                    "shadowEnable": False,
                                    "shadowSoftness": 0.1,
                                    "shadowThickness": 0.5,
                                },
                                "hiZ": {"enabled": False, "maxFrameLag": 10, "minLevel": 3},
                                "renderer": {
                                    "backgroundColor": 16579577,
                                    "pickingAlphaThreshold": 0.5,
                                    "interiorDarkening": 0.5,
                                    "interiorColorFlag": True,
                                    "interiorColor": 5000268,
                                    "colorMarker": True,
                                    "highlightColor": 16737945,
                                    "selectColor": 3407641,
                                    "dimColor": 16777215,
                                    "highlightStrength": 0.3,
                                    "selectStrength": 0.3,
                                    "dimStrength": 0,
                                    "markerPriority": 1,
                                    "xrayEdgeFalloff": 1,
                                    "celSteps": 5,
                                    "exposure": 1,
                                    "light": [
                                        {
                                            "inclination": 150,
                                            "azimuth": 320,
                                            "color": 16777215,
                                            "intensity": 0.6,
                                        }
                                    ],
                                    "ambientColor": 16777215,
                                    "ambientIntensity": 0.4,
                                },
                                "trackball": {
                                    "noScroll": True,
                                    "rotateSpeed": 5,
                                    "zoomSpeed": 7,
                                    "panSpeed": 1,
                                    "moveSpeed": 0.75,
                                    "boostMoveFactor": 5,
                                    "flyMode": False,
                                    "animate": {"name": "off", "params": {}},
                                    "staticMoving": True,
                                    "dynamicDampingFactor": 0.2,
                                    "minDistance": 5,
                                    "maxDistance": 399.0974199376461,
                                    "gestureScaleFactor": 1,
                                    "maxWheelDelta": 0.02,
                                    "bindings": {
                                        "dragRotate": {
                                            "triggers": [
                                                {
                                                    "buttons": 1,
                                                    "modifiers": {
                                                        "shift": False,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                }
                                            ],
                                            "action": "Rotate",
                                            "description": "Drag using ${triggers}",
                                        },
                                        "dragRotateZ": {
                                            "triggers": [
                                                {
                                                    "buttons": 1,
                                                    "modifiers": {
                                                        "shift": True,
                                                        "alt": False,
                                                        "control": True,
                                                        "meta": False,
                                                    },
                                                }
                                            ],
                                            "action": "Rotate around z-axis (roll)",
                                            "description": "Drag using ${triggers}",
                                        },
                                        "dragPan": {
                                            "triggers": [
                                                {
                                                    "buttons": 2,
                                                    "modifiers": {
                                                        "shift": False,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                },
                                                {
                                                    "buttons": 1,
                                                    "modifiers": {
                                                        "shift": False,
                                                        "alt": False,
                                                        "control": True,
                                                        "meta": False,
                                                    },
                                                },
                                            ],
                                            "action": "Pan",
                                            "description": "Drag using ${triggers}",
                                        },
                                        "dragZoom": {
                                            "triggers": [],
                                            "action": "",
                                            "description": "",
                                        },
                                        "dragFocus": {
                                            "triggers": [
                                                {
                                                    "buttons": 8,
                                                    "modifiers": {
                                                        "shift": False,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                }
                                            ],
                                            "action": "Focus",
                                            "description": "Drag using ${triggers}",
                                        },
                                        "dragFocusZoom": {
                                            "triggers": [
                                                {
                                                    "buttons": 4,
                                                    "modifiers": {
                                                        "shift": False,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                }
                                            ],
                                            "action": "Focus and zoom",
                                            "description": "Drag using ${triggers}",
                                        },
                                        "scrollZoom": {
                                            "triggers": [
                                                {
                                                    "buttons": 4,
                                                    "modifiers": {
                                                        "shift": False,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                }
                                            ],
                                            "action": "Zoom",
                                            "description": "Scroll using ${triggers}",
                                        },
                                        "scrollFocus": {
                                            "triggers": [
                                                {
                                                    "buttons": 4,
                                                    "modifiers": {
                                                        "shift": True,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                }
                                            ],
                                            "action": "Clip",
                                            "description": "Scroll using ${triggers}",
                                        },
                                        "scrollFocusZoom": {
                                            "triggers": [],
                                            "action": "",
                                            "description": "",
                                        },
                                        "keyMoveForward": {
                                            "triggers": [{"code": "KeyW"}],
                                            "action": "Move forward",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyMoveBack": {
                                            "triggers": [{"code": "KeyS"}],
                                            "action": "Move back",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyMoveLeft": {
                                            "triggers": [{"code": "KeyA"}],
                                            "action": "Move left",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyMoveRight": {
                                            "triggers": [{"code": "KeyD"}],
                                            "action": "Move right",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyMoveUp": {
                                            "triggers": [{"code": "KeyR"}],
                                            "action": "Move up",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyMoveDown": {
                                            "triggers": [{"code": "KeyF"}],
                                            "action": "Move down",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyRollLeft": {
                                            "triggers": [{"code": "KeyQ"}],
                                            "action": "Roll left",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyRollRight": {
                                            "triggers": [{"code": "KeyE"}],
                                            "action": "Roll right",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyPitchUp": {
                                            "triggers": [
                                                {
                                                    "modifiers": {
                                                        "shift": True,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                    "code": "ArrowUp",
                                                }
                                            ],
                                            "action": "Pitch up",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyPitchDown": {
                                            "triggers": [
                                                {
                                                    "modifiers": {
                                                        "shift": True,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                    "code": "ArrowDown",
                                                }
                                            ],
                                            "action": "Pitch down",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyYawLeft": {
                                            "triggers": [
                                                {
                                                    "modifiers": {
                                                        "shift": True,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                    "code": "ArrowLeft",
                                                }
                                            ],
                                            "action": "Yaw left",
                                            "description": "Press ${triggers}",
                                        },
                                        "keyYawRight": {
                                            "triggers": [
                                                {
                                                    "modifiers": {
                                                        "shift": True,
                                                        "alt": False,
                                                        "control": False,
                                                        "meta": False,
                                                    },
                                                    "code": "ArrowRight",
                                                }
                                            ],
                                            "action": "Yaw right",
                                            "description": "Press ${triggers}",
                                        },
                                        "boostMove": {
                                            "triggers": [{"code": "ShiftLeft"}],
                                            "action": "Boost move",
                                            "description": "Press ${triggers}",
                                        },
                                        "enablePointerLock": {
                                            "triggers": [
                                                {
                                                    "modifiers": {
                                                        "shift": False,
                                                        "alt": False,
                                                        "control": True,
                                                        "meta": False,
                                                    },
                                                    "code": "Space",
                                                }
                                            ],
                                            "action": "Enable pointer lock",
                                            "description": "Press ${triggers}",
                                        },
                                    },
                                    "autoAdjustMinMaxDistance": {
                                        "name": "on",
                                        "params": {
                                            "minDistanceFactor": 0,
                                            "minDistancePadding": 5,
                                            "maxDistanceFactor": 10,
                                            "maxDistanceMin": 20,
                                        },
                                    },
                                },
                                "interaction": {"maxFps": 30, "preferAtomPixelPadding": 3},
                                "debug": {
                                    "sceneBoundingSpheres": False,
                                    "visibleSceneBoundingSpheres": False,
                                    "objectBoundingSpheres": False,
                                    "instanceBoundingSpheres": False,
                                },
                                "handle": {"handle": {"name": "off", "params": {}}},
                            }
                        },
                        "interactivity": {"props": {"granularity": "residue"}},
                        "structureFocus": {},
                        "structureComponentManager": {
                            "options": {
                                "hydrogens": "all",
                                "visualQuality": "auto",
                                "ignoreLight": False,
                                "materialStyle": {"metalness": 0, "roughness": 1, "bumpiness": 0},
                                "clipObjects": {"variant": "pixel", "objects": []},
                                "interactions": {
                                    "providers": {
                                        "ionic": {"name": "off", "params": {}},
                                        "pi-stacking": {
                                            "name": "on",
                                            "params": {
                                                "distanceMax": 5.5,
                                                "offsetMax": 2,
                                                "angleDevMax": 30,
                                            },
                                        },
                                        "cation-pi": {
                                            "name": "on",
                                            "params": {"distanceMax": 6, "offsetMax": 2},
                                        },
                                        "halogen-bonds": {
                                            "name": "on",
                                            "params": {"distanceMax": 4, "angleMax": 30},
                                        },
                                        "hydrogen-bonds": {
                                            "name": "on",
                                            "params": {
                                                "distanceMax": 3.5,
                                                "backbone": True,
                                                "accAngleDevMax": 45,
                                                "ignoreHydrogens": False,
                                                "donAngleDevMax": 45,
                                                "accOutOfPlaneAngleMax": 90,
                                                "donOutOfPlaneAngleMax": 45,
                                                "water": False,
                                                "sulfurDistanceMax": 4.1,
                                            },
                                        },
                                        "weak-hydrogen-bonds": {"name": "off", "params": {}},
                                        "hydrophobic": {"name": "off", "params": {}},
                                        "metal-coordination": {
                                            "name": "on",
                                            "params": {"distanceMax": 3},
                                        },
                                    },
                                    "contacts": {"lineOfSightDistFactor": 1},
                                },
                            }
                        },
                        "durationInMs": 1500,
                    },
                    "key": "",
                    "name": "",
                    "description": "",
                }
            ],
        }

        return snapshot
