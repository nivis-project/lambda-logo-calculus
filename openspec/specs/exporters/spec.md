# exporters Specification

## Purpose
TBD - created by archiving change add-exporters. Update Purpose after archive.

## Requirements

### Requirement: An exporter is a registered module with its own parameters

An exporter SHALL be a module carrying an id, a version, a label, the media type
and file extension it writes, and its own parameter definitions. Exporters SHALL
be registered, and the registry SHALL refuse a duplicate id.

An export SHALL take a scene and the resolved parameter values and return the
bytes, the media type and a file name.

#### Scenario: The three exporters are registered

- **WHEN** the exporter registry is read
- **THEN** it holds the SVG, PNG and PDF exporters

#### Scenario: A parameter definition drives the dialog

- **WHEN** an exporter is asked for its parameters
- **THEN** each is a parameter definition with a kind, a range and a default

#### Scenario: A fourth exporter

- **WHEN** another exporter is registered
- **THEN** it exports through the same call as the other three

### Requirement: The SVG exporter writes the cleaned scene as text

The SVG exporter SHALL write the scene as SVG text without a DOM. It SHALL clean
the geometry first, so counters are holes and the paths are Beziers. It SHALL
use no mask.

Ids SHALL be derived from the scene, so exporting the same scene twice gives the
same file byte for byte.

#### Scenario: The same scene twice

- **WHEN** the same scene is exported twice
- **THEN** the two files are identical

#### Scenario: No masks

- **WHEN** an SVG is exported
- **THEN** it holds no `mask`, no `clipPath` and no `use`

#### Scenario: The geometry is cleaned

- **WHEN** an SVG is exported
- **THEN** its path data holds cubic commands and its fill rule is non-zero

### Requirement: The PNG exporter rasterises at a chosen scale

The PNG exporter SHALL offer 1x, 2x and 4x, and SHALL rasterise through a
function the host supplies rather than reaching for a DOM itself. Asking for a
PNG without that function SHALL be refused with a message saying so.

#### Scenario: Three scales

- **WHEN** the PNG exporter's scale parameter is read
- **THEN** its options are 1, 2 and 4

#### Scenario: The scale sets the pixel size

- **WHEN** a scene is exported at 2x
- **THEN** the rasteriser is asked for twice the scene's width and height in
  pixels

#### Scenario: No rasteriser

- **WHEN** a PNG is asked for with no rasteriser in the context
- **THEN** the export is refused with a message naming what is missing

### Requirement: The PDF exporter writes one vector page

The PDF exporter SHALL write a single-page PDF holding the scene as vector
paths, at a page size taken from the scene, with each pass's colour and opacity.
Opacity SHALL be a graphics state rather than a colour blended into the fill,
because a blended colour cannot be undone by whoever opens the file.

#### Scenario: A readable PDF

- **WHEN** a PDF is exported
- **THEN** it begins with a PDF header, ends with the end-of-file marker, and
  its cross-reference table points at every object it holds

#### Scenario: Vector, not a picture of one

- **WHEN** a PDF is exported
- **THEN** its content stream holds path operators and no image

#### Scenario: Opacity is a graphics state

- **WHEN** a scene with a pass at less than full opacity is exported
- **THEN** the PDF holds an external graphics state carrying that alpha

### Requirement: An export matches what is on screen

An export SHALL carry the same viewBox, the same glyph count, the same fills and
the same opacities as the scene the studio draws, and each glyph SHALL occupy
the same place to within the curve fitter's tolerance, the rounding the file
writes at, and the sampling the comparison itself uses.

#### Scenario: The exported SVG against the preview

- **WHEN** the studio exports an SVG of what it is drawing
- **THEN** the file's viewBox, glyph count, fills and opacities match the
  preview's
- **AND** each glyph's bounding box, measured by walking both paths rather than
  by asking for a bounding box, matches the preview's within the fitter's
  tolerance plus the file's rounding and the walk's own step

### Requirement: The exporters write text

The SVG and PDF exporters SHALL write a scene's text nodes. The PDF SHALL use a
standard font rather than embedding one, and SHALL write text the right way up
despite the page's flipped coordinate system.

#### Scenario: Text in an exported SVG

- **WHEN** a scene holding text is exported as SVG
- **THEN** the file holds that string in a text element at its position

#### Scenario: Text in an exported PDF

- **WHEN** a scene holding text is exported as PDF
- **THEN** the file names a standard font in its resources and shows the string
- **AND** the text matrix undoes the page flip, so the text is the right way up

#### Scenario: A string that would break the file

- **WHEN** text holds a bracket or a backslash
- **THEN** the PDF escapes it, and the file still parses
