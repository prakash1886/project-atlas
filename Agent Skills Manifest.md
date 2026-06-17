# **Multi-Agent Systems (MAS) Skills & Tools Manifest**

This document outlines the operational profiles, programmatic tools, CLI bindings, and cognitive schemas for each dedicated agent in the Advanced Terracotta Evaporative Climate Appliance R\&D pipeline.

## **1\. Orchestrator Agent (The Principal Investigator)**

### **Operational Profile**

* **Role:** Systems Architect & Workflow Supervisor  
* **Domain:** Durable state machines, strategic planning, hypothesis generation, and cross-agent validation.  
* **Primary Objective:** Maintain system-wide convergence towards performance targets (![][image1], ![][image2], ![][image3]).

### **Tool Definitions & Python Bindings**

The Orchestrator requires programmatic access to the Temporal state loop and the Obsidian Knowledge Vault directory.

def formulate\_hypothesis(context\_history: str, system\_theory: str) \-\> dict:  
    """  
    Analyzes historical design cycles and outputs a structured physical hypothesis   
    for the next experimental iteration.  
      
    Parameters:  
    \- context\_history (str): Content of the episodic ledger folder.  
    \- system\_theory (str): Current laws defined in the global theory note.  
      
    Returns:  
    \- dict: A structured JSON declaring the target parameters:  
        {  
          "hypothesis\_id": "HYP-0XX",  
          "independent\_variables": {  
            "tube\_od": float,  
            "tube\_id": float,  
            "pitch\_ratio": float,  
            "fan\_rpm": int,  
            "fan\_blade\_pitch": float  
          },  
          "expected\_outcomes": {  
            "pressure\_drop\_limit": float,  
            "target\_delta\_t": float,  
            "max\_noise\_db": float  
          }  
        }  
    """  
    pass

def update\_global\_theory(run\_critique: str, current\_theory: str) \-\> str:  
    """  
    Appends new thermodynamic, acoustic, or geometric boundaries found in   
    the latest run to the master system theory markdown file in Obsidian.  
    """  
    pass

### **Obsidian Link Writing Pattern**

When executing a run, the Orchestrator instantiates:

* 03\_Working\_State/Active\_Hypothesis.md ➔ linking to \[\[01\_Semantic\_Base/Global\_System\_Theory\]\] and initiating a new \[\[02\_Episodic\_Ledger/Run\_0XX\_Report\]\].

## **2\. CAD Architect Agent (FreeCAD Specialist)**

### **Operational Profile**

* **Role:** Headless Parametric 3D Modeling Engineer  
* **Domain:** Computational geometry, interference checks, and Design-for-Assembly (DFA).  
* **Primary Objective:** Transform numeric parameters received from the Orchestrator into runnable FreeCAD scripts that generate manufacturing-ready CAD files.

### **Tool Definitions & CLI Bindings**

* **CLI Runtime Command:** FreeCADCmd \-c \-P {script\_path}  
* **Output Assets:** .step (for standard mechanical parts), .stl (for CFD meshes), and .gltf (for Blender visualization).

def generate\_terracotta\_matrix(tube\_od: float, tube\_id: float, gap: float, height: float, width: float) \-\> str:  
    """  
    Calculates a staggered hexagonal nesting matrix, instantiates the CAD parts,  
    runs a boolean cut/fuse geometry operation, and exports a unified STL mesh.  
      
    Returns:  
    \- str: Local filepath to the exported STL mesh.  
    """  
    \# Computes structural limits and nests cylinders programmatically in FreeCAD.  
    \# Checks for minimum air gap limits to avoid capillary water lock.  
    pass

def check\_component\_interference(part\_a\_path: str, part\_b\_path: str) \-\> dict:  
    """  
    Runs programmatical intersection tests in FreeCAD to ensure structural separation  
    between the water delivery plumbing and the dry electronics pod.  
    """  
    pass

### **Decision Matrix & Adjustment Rules**

* **Rule 1:** If **OpenFOAM Agent** flags a static pressure failure, calculate the required change in pitch:  
  ![][image4]  
* **Rule 2:** If the structural envelope exceeds standard Indian desert cooler side dimensions (![][image5]), automatically scale down tube length and output a warning.

## **3\. Aerothermal Analyst Agent (OpenFOAM Specialist)**

### **Operational Profile**

* **Role:** Computational Fluid Dynamics (CFD) Scientist  
* **Domain:** Navier-Stokes equations, boundary layer theory, and transient thermal transport.  
* **Primary Objective:** Mesh and simulate the airflow crossing the wet terracotta matrix, outputting the exact pressure drop (![][image6]) and air velocity profiles.

### **Tool Definitions & CLI Bindings**

* **Core Solvers:** blockMesh (for grid), snappyHexMesh (for complex tube insertion), and buoyantSimpleFoam (for heat transfer).  
* **Output Assets:** postProcessing/forces/0/forceCoeffs.dat and postProcessing/patchAverage/0/T.

def setup\_openfoam\_case(stl\_mesh\_path: str, inlet\_velocity: float, inlet\_temp\_k: float) \-\> str:  
    """  
    Creates the transient system dictionaries: controlDict, fvSchemes, fvSolutions,  
    and boundary fields (p, U, T) representing the physical environment.  
    """  
    pass

def execute\_cfd\_simulation() \-\> dict:  
    """  
    Invokes the local CLI OpenFOAM solver, monitors convergence residuals,  
    and returns parsed pressure drop and velocity data.  
      
    Returns:  
    \- dict: {"static\_pressure\_drop\_pa": float, "mean\_exit\_velocity": float, "converged": bool}  
    """  
    pass

### **Decision Matrix & Adjustment Rules**

* **Rule 1:** If convergence residual limits (![][image7]) are not reached within 1000 iterations, automatically lower the relaxation factors in fvSolution and re-run.  
* **Rule 2:** If the exit air velocity profile drops below ![][image8], flag an *Airflow Stagnation Warning* to the Orchestrator.

## **4\. Psychrometric Calculator Agent (Cantera Specialist)**

### **Operational Profile**

* **Role:** Thermal & Physical Chemist  
* **Domain:** Thermodynamics, psychrometry, boundary layer mass transfer, and latent heat of vaporization.  
* **Primary Objective:** Define the absolute thermodynamic cooling limit of the system based on regional Indian climate inputs and water feed rates.

### **Tool Definitions & Python Bindings**

* **Core Libraries:** cantera and numpy.

import cantera as ct

def calculate\_wet\_bulb\_limit(ambient\_t: float, relative\_humidity: float, pressure\_pa: float \= 101325.0) \-\> dict:  
    """  
    Uses thermodynamic equilibria calculations to solve for the exact   
    adiabatic saturation temperature (Wet-Bulb Limit) of input air.  
      
    Returns:  
    \- dict: {  
        "wet\_bulb\_temp\_c": float,  
        "theoretical\_max\_efficiency\_pct": float,  
        "enthalpy\_difference\_j\_kg": float  
      }  
    """  
    \# Creates an ideal gas mixture representation in Cantera to solve   
    \# psychrometric mass fraction states.  
    pass

def calculate\_clay\_evaporation\_rate(water\_temp\_c: float, contact\_area\_m2: float, air\_flow\_rate\_m3s: float) \-\> float:  
    """  
    Calculates fluid mass transfer rate (kg/s) through the porous clay matrix   
    given the surface saturation area and current air boundary layers.  
    """  
    pass

### **Decision Matrix & Adjustment Rules**

* **Rule 1:** If the physical water feed rate is calculated to be lower than the calculated evaporation rate, trigger a *Dry-Out Alarm* and instruct the Orchestrator to pulse the pump duty cycle more frequently.  
* **Rule 2:** If the relative humidity climbs above ![][image9] (coastal Indian summer profile), calculate the exact sensible cooling boost required from the **Thermo-Ice Chamber** to hit the user's cooling target.

## **5\. Acoustics & Vibration Agent (ElmerFEM & QBlade Specialist)**

### **Operational Profile**

* **Role:** Vibration, Rotor Aerodynamics, & Acoustic Wave Analyst  
* **Domain:** Helmoltz wave propagation, blade-element momentum (BEM), and structural resonance.  
* **Primary Objective:** Minimize fan blade noise, evaluate non-symmetrical blade frequencies, and calculate the damping factor of rubber mounts and rotomolded casings.

### **Tool Definitions & CLI Bindings**

* **Acoustic Simulation:** ElmerSolver using the Wave Equation solver module.  
* **Aerodynamic Rotor Optimization:** QBlade compiled terminal bindings.

def evaluate\_rotor\_acoustics(blade\_coordinates\_path: str, rpm: int) \-\> float:  
    """  
    Loads custom scimitar airfoil profiles into QBlade, simulates trailing-edge  
    vortex shed profiles, and returns estimated sound power output.  
      
    Returns:  
    \- float: Estimated dBA sound power level.  
    """  
    pass

def simulate\_chassis\_vibration\_damping(motor\_frequency\_hz: float) \-\> dict:  
    """  
    Runs an ElmerFEM structural analysis on the double-walled, PU-foam filled   
    chassis CAD to evaluate attenuation of structural motor hum.  
    """  
    pass

### **Decision Matrix & Adjustment Rules**

* **Rule 1:** If structural resonance is discovered at ![][image10] or ![][image11] (standard Indian grid harmonics traveling through the BLDC motor stator), instruct the CAD agent to increase the thickness of the motor mount ribs by ![][image12] or shift the rubber grommet durometer rating.  
* **Rule 2:** If the acoustic peak is tonal (a single loud drone frequency), execute the blade-spacing algorithm to randomly vary the angular offset of the fan blades between ![][image13] and ![][image14].

## **6\. Industrial Design & Aesthetics Agent (Blender/CMF Specialist)**

### **Operational Profile**

* **Role:** Creative Visualizer & Color, Material, Finish (CMF) Curator  
* **Domain:** Biophilic industrial design, photorealistic ray-tracing, and spatial architectural mapping.  
* **Primary Objective:** Transform the raw engineering CAD models into high-end, premium lifestyle objects that harmoniously integrate into upscale contemporary Indian home interiors.

### **Tool Definitions & CLI Bindings**

* **CLI Rendering Engine:** blender \--background \--python {render\_script\_path}  
* **Core APIs:** Python-Blender API (bpy and cycles).

def map\_premium\_materials\_and\_render(gltf\_cad\_path: str, camera\_preset: str) \-\> str:  
    """  
    Imports the raw engineering geometry into Blender. Assigns PBR shaders:  
    \- Unglazed fired clay (rough, terracotta hue, high-absorption map)  
    \- Brushed anodized aluminum / Champagne-gold or matte charcoal  
    \- Transparent water-trickle physical shader overlays.  
    \- Glass-filled composite fan elements.  
    Sets up studio environment lighting and triggers Cycles ray-tracing.  
      
    Returns:  
    \- str: Local file path to the generated high-fidelity 4K render.  
    """  
    pass

### **Aesthetic Decision Matrix & Brand Integrity Rules**

* **Rule 1: Natural Alignment.** Under no circumstances may glossy white injection-molded plastic shaders be mapped to exterior structural bodies. The exterior casing must default to textured powder-coated steel or matte structural composite to retain premium appliance identity.  
* **Rule 2: Visual Feedback.** Ensure that the terracotta matrix is physically exposed in the render. If the CAD Agent wraps the clay matrix behind a closed, ugly plastic grill, the ID Agent must flag a design violation to the Orchestrator: *"Design Violation: Clay matrix hidden. Expose the clay faces to maintain biophilic visual waterfall aesthetic."*

## **7\. Collaborative Data Exchange Schema (JSON Core)**

To ensure these six distinct agents understand each other’s inputs and outputs perfectly, they pass data through a standardized JSON payload structure over the **Temporal.io** or **LangGraph** execution bus:

{  
  "run\_metadata": {  
    "run\_id": "RUN-014",  
    "associated\_hypothesis": "HYP-005",  
    "timestamp": "2026-06-17T17:45:00Z"  
  },  
  "geometry": {  
    "stl\_path": "/vault/03\_Working\_State/Run\_014\_matrix.stl",  
    "surface\_area\_m2": 2.148,  
    "free\_area\_ratio": 0.443  
  },  
  "physics\_results": {  
    "measured\_pressure\_drop\_pa": 32.4,  
    "measured\_velocity\_m\_s": 2.15,  
    "measured\_temperature\_drop\_c": 13.8,  
    "measured\_noise\_dba": 41.8  
  },  
  "constraints\_status": {  
    "acoustics\_pass": true,  
    "pressure\_pass": true,  
    "thermal\_pass": true,  
    "aesthetic\_integrity\_pass": true  
  }  
}  


[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH8AAAAaCAYAAACehIP6AAAFAUlEQVR4Xu1ZS2tVVxS+l6SQ0lrT2jTmufOywVKxGFEKlrYh1UopFh/goJTS/IAW0kYUB51kVgUjQQh2ICKlWhCpIVIyUAcKOggWQgc6aEJECIRMtNQWjd+Xs/Z1deXk3Kcpue4PFufstdZe+/Htvc+6+6ZSAQEBAQEBAQEBy4l0W1vbm62trdtra2tfskYL51xvS0vLzxS893k9yt8zjvZNRHNz8yUEmMezH7KXgvJZ6iADSjdJna3/PAPzMQa5j0n/Hc9HkDt4f1/7oLyWPpCL4jMf4/MlHmm+d3R01DQ0NDRquwfqPhBeWo2e/bhFO7jq0rZEoMIsGj+oVJXQ/QK5h0Btyu9DyL/K77kGdthqzMfJxsbGF1kmYULMnPEZ0z6Y66v0wS7fQh3m+FWKr0PAvluXRbdH4v9gbb4dlw/57BScP9c6lLeRZMiA1qOzG6Gb0LpyA8ZXBzkKgrZamwV8TpEMPPd7nYs2DU/RbUv5pKLNRRL9Rqpsamp6W9nTsL2ryoy7cBLD7z2tN2Dc3MmH83pnjhBUPiAD6DH6HuivaV05AYu7E+P7BzJkbTHwpyNJHPRKvA/I3H0q5UU+oqcu8wnF+3k56ivw3tvV1fWCcqf9If25w7XewuVDfhwQ4E82hNVaZW3lBoyzGzIOOYxv7SvWni8QZ4Rzl0QA51XIf2BtcVD+WfMt+O7Aaf6a1ecMFx35WRta4ajARO3COGcgvdZYKBBrjnPnv/Fx4BEvZP5qbXGor69/PVfyi4JaZdPWttLBn1DYkV9jbH+QeKgqrE8xcFFClknk4iA+j5J8LJaNfKzYBmloxNqKASb7HasrFOjbzgLi8Rv9F2Q8VWLSCZJJ4rP1iz5YgFNWn4R8jn351VDY+CTZe2yTvWLA5AUxz1p9ocBk3PAJVT7gUYx+fOVKvPOZhCHeVcharyNh1gftjhmfau2TBC4aki/kLgkubkid1WeFrDAmLNNLXTIQ6MA++BxKyeSRXKz8WtT/AMXK9vb2NzDR63ziIUctLzfqaNP+fMfzM50g0SbHYiXbYCzU/YQ2IZCT8AX6uCYlFyP5AO3td9GF1aTNqvOFkHpOZ+GdnZ2roNup/egDGdU+GMMV7ZME1D3JcaPvH1ubBvmzCy8ncLej8mMhdhFg/8ipCwwX/fb0SQt/m16uqal5WXwPeEL5dDGZrYuSrfV8B6kdjCWJEmOd0bF0fU5CITs/DojVjcm64QrL9tlP7sgzkGEl193T3ZdGX/uX8Jn8T7QskE/LPOS0tcnpOpyUaMaCHWUGikn4TYIPcTdyB+qd4aJTIXPJI6Rkbvxc/uRz92UmibGa1eXIcpAvSMvY/5bTJCegzjcyX4vE9z3JB3LZhMwKjHuKdbkRU+qzxfniIlaupQUanYDc9GUhRV9UZCXfyU6Xd03+AqlOrjVzIR/PTUX9po0B++NyvOH7P4HNullOlEE891l7yYGGfnLqJ6CLbrP0ZyBDPt4PxZFPIpW/Jp/Z+Jy/5tTkM5avL2VP/nHfxjNASZLBsgIm+y0X/Tv1I+Q781m4DRl10SL5liSBxGOp6Ejvc9FV5xHlz59GF1yUDM3qWNjRGyQWv486FvtwAuW7PFIZ29cJWAZg0quZD1g9kPYZOHyqbCZts3MnO59Cf+W6APpTaLPtsQ+6HLBCwEUhl0kzzGCtPaCM0RLhmBzpw9YeEBAQEBAQUHI8AUjCnmzdYIWfAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkIAAABoCAYAAAAdD595AAAQG0lEQVR4Xu3df4icxR3H8QtJqaXVRts0xmR3du/OhqCgNFaxVfsDlYZiK0aooLWgiFYiiH9otVjUUqhYgk2kFpsi/iGpmvqD1GpraFNT2jSBWkERbMVGYoNKDAQVYjDX7+d5vrM3N7d7P3f39jbvFwz77Mw8z7P77Jnn68w8MwMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQKeFENbWarXTlyxZ8inbfm5wcPDTeZ3Vq1d/zMo2ViqVoWq1eo1tv1Sv14PKbN/F9n4kST/L9wcAAOg5Q0NDFQtc/h3f2/ZuS+vSOmLBzjcsf1t87wHPJm17APWSpdes3lmWtaCxIwAAQK+y4GWDpffjewtkHrL3+9I6UqlUzrD8f8X3tr1HSdseCC0brQ0AADAPeOCTB0KN961YncOWntC2B0Lr1Spk+z9lqZZVBwCgv9hN7zGlPB/tpfE6dp23aYxOXjaJBcuXL/+MWmqaJYtVjlElHXu6gZCVr61Wq+cnWeoKK7rDKpXKF638g6QMAID+Em/OzQbVtmI3zmdtn3fyfEzOgpMT7do9MJ1gyPZZbOmn2q9FWuP1ptUiVK/Xz7Tyf+b5kf3Oq7X/0qVLP5mXAQAw79mN7ma70R3O8yeyYsWKTwR/osj2PyUvx+Ts2q2dKECZqUql8i077kfxvW0/reRvF8aWI9FTYvFJsZNOOumzCqi0reDJftcLtJ20CDFgGgDQf3TTtPTjPH8itfKJoxcUCNn2vQPcJGdikQUb96tFJi+YDXWf2W+yK76332ivvb/Mt6+2tNk2F6lVytLz9hneULL8ty09qnpev/hNbftWyz8QjwcAQL8obsRqQcgLJqKWglB2iS2y100KhqYbSGFUp66fBVgXWhBzcZ4/VYODg5+33/rStAUJAIC+4QHNR+rmyssmYvts9VYFbZ/tN/L/5fUwNXbttocOdJEBAIAJeABTdIVMlc9GXHStxDx7f8iPVU+qNljA9Qcr+5OlFwcHB6v2etDS7y19aGVX5vWPNj5QfWcckwMAADrMb75HNNYnL5tIpVI51/Y7O81TMKVAyI51R5ofWdl99rLAg6V9y5cvX+H5T4RkUO/RzK7DOktbp9s6BwAApk9jeza3ClxaUQBk6e0831uJimCoWq3ekpbZ+/MtHe9PJCkQujwpu0V5K1euPDbdZ74K5ZIU+o4zmZE5BooKGgEAQKdUKpVT7YZ7wAKR1XnZRGyfzQp48nzx8Ua6kb+S5seBtlZ+jpXtt7Qqltn2w9pHgdLoHvPaAvu+d88wENL1OGJpb54PAADaKJSDc0fy/EmoFWnCrhu/kY/U6/WlWZFaOxT0bEgz7f37M/gcPc1buWYUCNm+D/r1aIy/AgAAbeYByJE8fyJqRZpsPFG1nGlaY4WuS/O9W+xlS5ek+apr6ZBtLhwaGvqcba9RoGXHuciCqfNUR7MZ6zHwfMZrqzds9a/Xa8xTC5fyvKVrYczXMXRsHVOTA6osPZ/m3dGkgra9XPUVyNh3+KovZ1HM1izDw8PH2bGvUOtWenzV02fWZ5xNIGT7Xa5rYscYzMsAAEB7xLEocabhScWutDB+SYc8qdWneIJMAUPc34KKa/2cabfYWst/Nc5q7Hmqs863L7H0qMYfKTAIyerpoXzqrBiwrfp2jJUDZYvVQds+LX7epP7DAz45oG3fleRrtfUiaFEgo6RtX3B0uwVGJ1veDRrcbYFTJY6p8uPv17blfUcDyP2Qs+oaSwLGMS1nAACgTZJBy1O+2drN/V7fZ8qpNnZm42IsUPC1tez1S5YOpK05Xq8xhkhBSfAWpFAuKrpH2xpzZNsv63vovVp4YgBjZYvz+v5eM2dvVICTrpelOqqr7WaBkF5jXQVzVV+UVIO7rXxHrFdNxjjNpkVooAzmtuTnBgD0KP9He2SC9Kalq/L95jt1jdj3Otzk+8akG++WfL9e4AHGYX2HvKxT/FrtVxCk8UMKZvI6EloEJspTmbY9kNudBh+iwMHy3vB1scYEQgNlS03N8v4cki7BVueLAU6s53U35NcsnicNWmYZCOmYagk7EoMuAEAP0/+B+83gA0sj6kLw98vUrRB8MGw+vmO+izd0+26P6fvpphW/tydNHjgSsjExvcBv1PuqXRyH4tdid56fCy0CE7+mMbBR196Yz69JGv03iN1qRX3lKcUlROJj/nG/9Hz6rSYKhGrl2mqNR//1N+2tU0/H1imZbSDkgZxa1K7NywAAPUr/cAcfM5GqloNXFQxtS7sk+oW+s757ni92I3vIr0tjsO1cizd4pW51vWgAsl+HRhCR08Blu167vN6Htv1IKFvVPvLt91SmOqqrNbC8vsYlbdcxPMhRQP6Y/d39yAOSHQrObfsftr3T9nkqlOOFCrb9V0t/t7TF6tygc1h63NK7vq3X9Un9DZb2W90n7fUnnq3AbG8og+Kt/rvrs18f95uOUAZxOnfjcwIAepjfXPUP9468rDrahdS1G283+fduFgjFsR5qLSpaGXpBMhhX3XYdf0TbzvOcpQ/9Or1nQcK38zqzoVY5BUDxvbfQpK0xxQBps1D1mv0N1spxRUW59s/Lc6rT5DjFU2ja8LLGE2XTlfz3tD0vAwD0IPsHe43/wz2uG6jqj1NX+3ANJX8kW997XABYK7tRNKfOhPPudFvSQhdbM9CD/O8qHeMEAOhVuqmGbMbgpKx4lHpg9P/M+0a1fKRbN6xxT18FX24ifTS8F8RASN1GeRl6h/9dsRo9APQ6Dwb2WXo9jJ1P5i0PBDQp3pwEQT753RvTSfkxJhLKAFCtPlo4tPje1XIsisaH3KPz5/vMtWr5xNi49cDQW/QbBQIhAOh9wbvFarXaH2Mw4AHBFRq/kdfvF94tts3SO9VyWYTie9t1uLNSqZyR12/Gx5I0DRI13iQd+9KKnXOtnf83eX4rSSDUM+OWMB6BEADME6F8AmkkfXz4aKDHsT0AnNEjzv6E0xNNBt0WdBOsTmFB1OBdj1MNOmcSCPlNmdSGlF/bVrw+gRAA9LpQdov15RigiYSyW2zE162aET1mPdtAyI5xsdX9RZ7fSgyEQpOB7egdBEIAME9M5R9s3ezr9fqFVm+Vuo10887rqCvNym8f8MeOw+ikjCf4wpfLfEbiYgJHf+R5MprfJZ3kcNKUH6CVMDp/0KQBoH/+2/LAJg+E1N2mQEXfM0wxEJquqk9nwBih3qa/Lf0N5PkAgB6SzHfycl6W8lYL1dM4Gq2u/UNLa2O5bX/dbsxX2usqS89oxl573e373GbpLm1bnb8Eb4mxY/4gPUe3+WebtKvDv9duPT1m7rHPfWIsSwMhK/umpbes/qW1cl2vTgVCPDU2D/jf18E8HwDQA/xmWgQCWWo5g3IolzIoHjOPsxvrtVauSp6u/bRDAYK2vexszy+edNIsxfb6y1i/25p8Z6VteT2pZYuDSkjW+EoCoXFLRoQOBUKhbPnaE68xek8yP9VreRkAYJ7SzTe2QmSBkJYj0CPo6aP3V/s+q6z8Dk1IaNu/1T4+SHlGSxd0m3dxjZlR229wN2k7BkJ+PRprXnm9jgRC3Z5ZOrLzrdN3z/MxHjNLA0Af0o2+RSBUzMAc66lbzAKIM5P9Dlmd5+MN3LZ/PtDFG/gsaZmNvVrrKmbY+wMWzJ2q7aRFSPljJqQMHQqExIPPMYFXp/mNXV2a1+VlGEt/B369mP0bAPqFAgJLt2k7DYS8tWfr8PDwEq+nMUSNxTl9v2LVct0Y0rL5wD7vuxbQXKFtDZq2QODeAR9gnQVC79j7W7Xt16TRhdZuCkhDi5nAO8FbxrS4qVr+XoprcqE5Vp8HgKNQbfximQVvNYoLYeqJskmf0upFCgamMEHiAgVLep1i/RmxY5/WrRutgh4FP9q210v8vLvyehgVygcExowZAwAAbeLdjCOhyRpp7aausKovXeJPA+q8jBVqTd2pWyxt06DpvBAAALSBByT78vx2UxBk56nH97a901uFLkvrRVa21spe9To32uvfLP0nlOu3NX06r5/4E5nv66GAvAwAALSJ3WwPKNjI89vJx0TdkeZpvJQHYTvVQpSWieW/oMHkCgY8XWXZC+31a5YOa/xUvk8/CeUYOU0VQbcYAACd4gOmdcM9Pi9rB+8G2znQZExXEgxtT/N9nFgxGN7Li0Hy/r6Y/yj0+dIg9v3+q++e5wMAgDbyVhe1ChUTVrabur7s2HvzfPEB1Ap0GtMmuAU+QFzjZFTeGMPkT1J9EEYDpTV2jtMbe3aBzpnntZuuSavrBgAA2qhWzuH0ip5Qy8tmy477ZrVaPSXPj3ReBTv6DHmZBz1jHu+3Yz2o+rHLSE+e2fZFo3t1lnfzdfRpN/t+WoflUOhQcAoAABLxKa5WA5dnyudBum+gSbdYFHymaUtb83E/tXJplR0rV648Nqmv2bDVZbTIj6+g6Mo43YDqDA0NVWzfO0PScqNyq3+ynpTTQORkSoIFVrdmQeB5w8PDH7d91lv5l2OZvb/dir/n73X+9f55l/k5286vybjrAQAAOsRuvNstfZTnz5Ru4hZQPGvH/FUYu2xKs/R6KIOLR+P+yRIgjW6xGLDZcW+Oef6+0SLkXXHF2BoPlBpLm6ield+tQMm2b/D9NXP3OQq2Qrm+3WJLx/jYqdg1pYDoRQU+OkY8fifEz9+puaMAAEATlUrlXLsBH2pXK4QFDBeE8lH3kWmkQ3H/ZCzQgXq9fqYHNZs8CNKEmgXtl3WNLUxbakKyhIjq5d1owZcwibOcx+7BUAZhT+f1uhAI7dJ3zvMBAECHaS00uwm/kq6JNldCOZlgEXColSbt+krFQMhev2DB0glW9/sKWgY8WGoSCI1Zt83KntF3trRZQUiSr7FJWpB2jDQQ0jnz8tmolZ5vNp0AAADoglAubqt10OZUGB0LNKEkENqoIEf72euzSfkeLSWi7RaB0EZ1hfm6Z42WJh0jJI/t6xhaBy8LhDbG8tlSV5gd7wG1fuVlAACgS+INWU0TeVk3KdhIA5FWLDC53+q9aR/3xoFyLM+aUE4H8GtLmy297eWPhLKrTqlY80xse6ufq0g6XhyfY/t8xfJ26Fg1f0RfZX7Ox/2cbRHKRXkbY58AAMAc8fE42+aii8aCge+GMniJgcmTw8PDx+X1UhaQLM6y4jghdaUt8tSM5inaFMdFeRB40M55fqyg43hr0RhNzjlj9Xo9pAEYAACYYx4M3ZTn9xk9Or9Lj9XrjX/nFxWYZPU6xgKgCyxdk+cDAAB0nAVCZ1nw8ztLLygImqz1CQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAECX/B8kalB/3GIrTwAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAB00lEQVR4Xu1UO0gDQRC9kFgIiooG8XKXyyVF8IfFgRLQUrERROxs7GzsbQWxl2AlAUshbZqUlmJsRbARJI0RFQSFIH7eJLNhM56ouJXkwbCzbybzdnZvYlkd/Ct4nveWSqX2JG8cjuN0Q+wdditjRkFCyWSyDKEnEoQ/LnOMAVe3CJF7WIG72wEdkXlGgOIPsBzcGNYjTdAsgiDoIgG4MdqTKItVRaqOiO/7C+l0uo/3UdzOciaTcduydLBQ0WIhBXB1FvR1nmM5FD7Fuy5xzhX8eYqBX+ev+fMTcBe1EL5IhVBkKySWR8FtrGuUgw6nVQz5Abhq2CHphzXXdeckz2NQ4pNv6rFEIjGIJQq+QnE9hv0K7AWiszpPoI+hRIVlgEBXw2IXOP2wjIO/gz0Lbhf2iPwpnW+0rO46DNqQk7V1R2D+XO3j8XgP9sewCuoOtBJxdRMgb1rEF+BBbwjqfDab7SUOb7ehODoQcbhmR8+lwL7XnK2Db+yMCnAReiv1+1HidDH4l+Be1b4FVeCXdqLmCn7ea35ABXR/jbWOdUzq/Bn0Hihe4a4i8Efg98s8I/B4vmzbHpIx40BnhyRmiX8d48B1zUBsVRnGY1LmdNDBj/EBCLqWOeU+gW0AAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAAAZCAYAAAB5CNMWAAACSElEQVR4Xu2XP0sjQRjGc+gVoiB3GnPmz65JbKwsAh5ccaUIolwRP8HBXWUt+BUES4XgtxDBwkIULExre4WVheA1Wgje6fOYd2B43d1sJm60mB+8bPaZd3ZmnpnZneRyHk8aZkCpVCrj51C1Wp0PguCXzvEIYRh+QzxK3CGWdY5HwEpqaK1XPmBJftfioMFA1jHTc1o3oOwnooW8tUKhMKrL0+BkFhrdRtwg/nFJ4iEbOidrOGC0fStb4kH6saLzMJELKPtbq9XGec8r7o+o69xu0KxyuTzL33h9ndN8nfMCJH5FxSYaDlDh8i3MAsPox49KpVIXQyLNgnaIsv+2hnpL0PYx8BHeNxqNj7ifjop6vT6FlCGTZ56Bsk3EvbnvijywJ7NotN2oBgP4LF+c1HDG48yijvijNPb7EX35betJoE8TqNMW89jmBp+h82JxNOsL8nejDGMZ4iSqLIkUZh3bGvI+ib5n60mYsRqzws7KytYsgm2DauGFbQqNgtbq1SgSZ1Y+nx+LMitO74b0eyvsfCzOetoBrmYRafjZHNcVZRiUWYRffrTTzMl7LDX9mEXMCkPsmZetC4M0y5n3bpYcL16YYpl1YOuZ0q9ZYlSLW5BXXZ6WOLOImHJqa8VicVL01C/4vnE1a1AveAL9HnFla/wTDO2O9Ww9U1zNQp02jdG66wpLMiuIOJTiILsaWofSTKE57FxEXCKmdb7NzCseSiPaN3Gs8palbzwb8Xptl3sUmOA1mLSDLbiYNFkej8fj8Xg8b8QTIlfdKCmv1n0AAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAAAZCAYAAABq35PiAAACzUlEQVR4Xu1Xv2sUQRS+JVqIooKeh/drdu8OIZ1wogiioiKmEAUFRf8ARezTJkUqQRDsRRsbuxRaiZWITRBEqyAHiqAgWEQQDPH73Jnz+TJzcVezgrcfPHb22zdv3nw782a3UilRosS4wRhzG5dI83kRJUlyWJMhxHG8t9PpbFPcGcQ4KbkigDFr7Xb7hOYzAWrehH2CLcNWEHBa+4SAiV9hH2ngjmi/AhAh7zuazAwkfwCBzuMNtzGZQRYx4Hsafd5bIZ7BLmmfIoBxE9hrzecGgu3OI0a1Wt2i+aKBPB4h9+uaz42ixMBK3M6x0Pd4s9ncRA77fT/4s2hOOD/WANaeRqOxY9g5AK4K2KTmW63WPvDXYFO9Xm8rx9U+XuQVA33ewO7BLmNCz+0bClZ0TBAu5gbsA+wh+syS7/f7G0263e6DuwAqwjXG/SIuF3+N8hMs4Pp5t9vdhX4vGdNxjIl8+9IviD8Q45y7t0mwEA85H5iUnfi8Wx2E5VYqQkxM4i7N3Wsg1iH0SRTH+EuSs6fN+onhg5hQEE4Miil523cguVFicILwf6F5rhaTFnTG48uZg+g97RfEvxADNiV5y/22GOBPwX9B8wT4SZeLM7ltRsJkFMMWp4+8St4NLDkNt4z1srV9V4kB7gGaGyRPmLS+zGjeAc+P4fktlxPaV7WPF2uJwb2J5bdH3E9zgMBS/yo5jRxiPPGdWiHexn8lOWyTRsh/FdYQI7KJLjsC7YM6cRZD6zcveY2sNcM3CTuW99vCiS25er2+0wRW2BDuDXtsYMS5jPYXo77ybKH6BnsMe8d+SD6WPhqecX78AihuCWGOaj8j8rEvzTsxK8Yi7K1Jj3D+bnyujDjy/wq4dZD4LE1uo/WEfQlPNe9Qq9U286RBc4LHPY1t7fdfAELMmfR3vQSEWOCxqvlxBD/TZzQ5luAPlz6SS5QoUQi+A6oK/BDfUHjpAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAYCAYAAACWTY9zAAACbElEQVR4Xu2VPWhUQRSF3xIFRUH8WVb37+0ugoiIyPoDYqlgo00sLAUbizQ2SgTBxsJOtgksgqawspQUxhTamiYBUREDCoEUEmxMJSF+h52Rm7tjEgvB4h247Nxzz8zcuTtzX5YVKJBGuVze3Wq1PrXb7SPNZvMN40mvASX469hZH1iHPM97LPIS4Q4fs0A3hqZlqJF6vX7czmN8E7umMWt2mbOCfz/O63a72xlOw6/hluK8JBDNSvgHWzW6ZR9j89smfgj7WqvV6oZ7EMeGW9i0WgLCOU5es5xOBj/T6XT2WJ2qYHUWxDpolpSg4e4YSUkHsWtuCBaa8n8j3CjJHnbcZontRTPL/ToRqBL+sxiHP6NqRf+vweQXJPoowc81Go1TJPCU8UfsHPSI1bB5HivNbx/tRAgpyVdbrlYKLLDoqxX499g8doMNr+aDe/Y8ofuM/VCCHPCgOFVL5rVbhu4EVbnieYHYRRLeZ/zzbP6TzS9ZnQfxcSUZfcbfsKlgfatNghNVEH7AjvpYCtJhyyT4JNvg6aNZiNUKfe4tL3d/+LtfO/kwEPWwNU32sbDIKoveilwe2oMWT83JBo103L3su/al6jGpINFPIg/9LLUJC1xQDJuPnPoV/iI2U6lUdlm9oF6lajlu0iYW1vjdXpJAsKLNPS+Eio1l5i+TLz0bHTPSCL3CdX1Q8BXjPp+uVqsHrGYIoSLJxARiS6qc8b/n5stgEap10vOh8o+jHw67zUiGgWgUu+d5C11aNH2sp6+DjwuqCIlNez6Cue/yQR/8gu6hj/8zkNhl+730oOXsDH1wqEEXKFDgf8UvaXqoEI+M/1gAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAACaklEQVR4Xu1WPUhbURR+QQotWlqQNIQk7+UHGkqRCsHBoWuhgw7tUqx0dXdQKB106NJRnN6mUBBXKRQRyeTQroVOBRXqUopLFSxo+n3JuXp6fM/EgMHS98Eh93zny3nn3HffvdfzEiT4J5GqVqu3LZnJZPoZk1+LlNjlUSwWh33fnzTczVKp9ERzgr4gCBZgYaVSKdigRjqdHoCuDmsYq18QazBmc3UEFD1lk6GxXasDvwHbdz40M/BPvDYzCE0WtiOWjYiT53PPxS4FFDSGJMeS7BdsIp/P37I6iS86H28sA/8r/v9Q6yxYoBTbk0bqlteApiYPe6p5vM0lcB+4FDWvcd0aoeaADWke3FvYN74dzWv0upE92DJm9gXsE8bHnlr70MxGNRLHa6hGjmDvYaEx8g3q3H9kM2DeVypPc/k7/xzcN+J87Eb34H+BPVeayILjeA0WGJzN+h60u9qEp/3VCCZ0zvkYF0UTOq4juJ2sUCiM048rOI7XUI10vLQ4mdhwhjj2W7sja3l89q8OIW+J2/AsfYynowqWRn7CHmheo5tGNPhcxr022zyFP2DfNWcbEf8QszKidUHrcLyyjz2Xy+UZwwpZF20W47tW14Qk+W2410HrIxylXy6X74jupdPwigF/wzUbBz486KIR5J0U/vRbxfhZ1LWnCSbCjD5yPg9DJPkIfk0fjJL09EBELAd/27+iAxH+PnlPllStVrsBfzX2CsPZRjErEG3KAcekW1Ynr/kzLJTN4AT2xuocLrhPtb1ruaUdZfY5FikUNw9hiMbu07cCAS+N76hDY4M2mCBBggQJ/iv8AXjiFO1EyRXDAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAZCAYAAACCXybJAAACm0lEQVR4Xu1WPYhTQRBOCIJ6/iAawuVvkxAIViLBO67QQiwU0crO0sLGSuHEw9bW4pArDpvrDhsru4AHNqKFlQiC4FkoeKAg2Ag5/b5k5rKZ2/fMRSIp9oPhvf1mdna+fft2N5OJiIiYMHKWALKFQmEGz1yxWDxona1W67Dl/gXZer1+zpKKZrN5xDm3CluRokLIVavVCxJ3xzotEDML+22tVqutiW8z5LN59gQkeQj7BusyIQq+a2MI+L7DOl67Q86PaTQaR8lh4uaEyqK9jZyLflwIiGmLqI0E30/68vn8IevfMzBr80h6DQVXkXQzJLpcLh9g8Yi9qBzfydGnHNq3YI/wmvW4d7AtbSfhv4pWOFlKIdHk4PuAL1hQTuMh/qbEaGGXBj17k8NlyiW53+ctpk60FD40IOKOgXsNeyztKyyaBQ569vI+IO9PWAhTJZqDcDA7oOVlNewSncRbeKK3XH8T9O0pbNvW4PoT8SYjJ4DEMsfpncRpcNMjuov3T76B+yo+K/ozbMFrc2K62v4r3PSI3kjw7Vre4Nd5dMqp0cFv+KpUKh33+6YiSTSTMqEd0BP9jJsUnrdD4lQ07KTPW4wjWoHx77Gvd1SOBpcgmpCN7IV/E8JN6QS4t85sZJVK5cygZy/vshQ0sY3MyR3Da9/w/YlIEw1+AfYFvoZyEHEK3A/9srLEXsKuD3r2+nKV7BSUhHFEt9vtfeCe4KO8Rz1OaF6IljQmFWmiQ5cTfNGrLHKEy8lHN6HLCfhF9kEtZ5VDPc2QhiEwQAazxjvvrMbh/bIMvCTGo+W8n0vieHb/4qUFz+ew+/wiNk7BMWS8IZNfKvXubXk1/mp2nLEhm9oKbDlFSA5Fzbv+mTnavxURERERERFh8Qfm80eiCx6LMgAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAACqklEQVR4Xu1WTWiTQRBNUKGiUC8xhvzsl6R4FqJCQWxBEESkQhGlevLSi2eLx549eS1eFMQi3jz0UkrwJAqeBA8iUrAE2psQQVHa95LZOB027ZdYD5F9MHzfvJ3ZnXm73yaZTEREREQ6ZJMkWXTOLVUqlRv5fP6YDQgBOWdqtdq44Waq1eplzY0E2DxsTfnPYNuwWR0XApqel9iegZuycSMBFN+G3fV+vV4vw/8E+wqr6lgLnJ5riGmJCG9gczZmZKB2ckxxt8mh0QUda0EhcrncccuPJNDwBuy74f6ZEBQccxfwnC6VSkVQh8rlch33ynm9GRyHXef4n+wOf4L5WPsS8o8yh7mcQ8eytr+6q5Ccx0IfYR/wmZy04xryaXyBPaV4KOotnvcwlLWxHpwTcTdF6OVisVgij/c75DD2CM8lco1G4wg52HOfj/rguoewTdgKxSCP9xcSu8L5yeGZyJy3fH5q8BRIkRfsmIUI0btU2ST835oLgadIit7yHOaqwW+h6Nf6l0ji1r0vsQ3hX6m4zilG/oOM2gjhnng/FURtXp5X7VhaSIHbltfwQugC4RfYMMXVsTJfUAgdK5vC2IKOtevsC+4CklbxrZ2zY4NgECFgjz3HBtjwIELArijuYIRw3f8Tn73PYve6CCHYWcRv8al5KSaVEPwMPccG2HAfIVqaEyHafCqurxCwl5rrhywmuQ/VTmkSye90UbiUJvDpXPQ+m5BmQoX/0JzFEEK0NTeEEE3NBYGgWU7quidC2ze9kOtegtzpw+JPOnNkeYPLwr1LLIQh7oiQEKnvCJdSCAaGrKk/DfjvYT91rtwrv2Brrvt/hM0lOsYCMet2HaRMG65zWgKcb3ZXXCCWG9s0HNfdJdKBAmKcRiOLNL7b8YiIiIiIiIj/EjsSDRp5dXjhKQAAAABJRU5ErkJggg==>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAZCAYAAADNAiUZAAAB00lEQVR4Xu1Uv0vDUBBuaAVFUfwRAm3StGkURLeA0j9ANxddHcQO+i9UEARXJ3ESQbqJi5OIm6Pg4CQO0kGwdCji5KBF9Dv7Lr4eEVLRRfrBR3Lf3b273Mt7iUQX/xqu65bAfXpmMplR6c9ms+e2bY9LXcDwPG8in8/PW5bVL50hEDCDQnW8GkpK5nK5MrQljkHBYdjv3xH+OYpD3gqv4/u+ieZtXqMNSDpB0qGu4Yv6oF+i6yGyKRn2mduaREjkHeH5ghCDGiPq68C3qNsh4LgHn4ScgnaTTqfHyMBiC/iKXhFDuVU06Csz5TjOtOY24C9q9hfguKIRgaswk6ShwCy4xTGmaQ7wO4OKudoWEGCfqJEm8V4KgqBH94cgBwJ2VGHiK7gh43SgoXXEPEi9U1BnXJR4LQMYhULBgf8O3JO+2KBksKlM2oeGKtzAXk61BSc+42/BR3BS+mIDyW/gNtv41QcxvgoV1veVoRqq4qhZ0hcX9GXP+KJA6DzuU6Fz0Yuonysu6GhEjgpaHdzVNTTnqQlUdL1jqEXKEXqTbxoGTeRXiuK8jWChY7Cm9rJGC0edMehFNd4D6fsJDBRcc1tX23LUha9Ae73JN1UXXXTx5/gAaJB5+eD+g8UAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAZCAYAAADNAiUZAAAB8ElEQVR4Xu1UO0gDQRC9kAiCgviJkeQul5+CYHeFBCzFT6GFIlpYCDYWdhaClbWFhYiFYGEhdoqNdcBGopUoglhZ2FgH/BD1vdys2RyJnsFK8mDYnTdvZvb2c4bRwL9GPB6fsW17B+N8JBJp8caJdDptQbML24JuwhsHAqlUqi+ZTI7UqlECCkzDihC30UeCnUgk7jhqsgC4K9M0exXBxSHvA/yS4jBfoJbzTCYTjsVipopVAImPTPZwy7BtQwpEo9EuamDXSsOCwl3QxyLaaSpOIDal+wohSSzoJJId8pZlTdJ3HKdJdKeaJiXcjVAh6AdUHAggltV8F+FwuPW7prA1ndfBBVGDLV1XHPxj2dIg5otcbDlDQ7Wm8MeFP9B5NGiGzcHyjOOMO/S4b0jxN53Dl64Kn/Pww7AH8K+wS1BBPe4b6rbCRg33HDZhR2wKbt+rV8A2doom7435AhJ7UKAoX7cCy8q85pkSoqm4+XWD24hi7xyFCmI+xFHXqaY8a53/EUg6l9WW3qThPqNDdSvlhuekeMV21/2lSHpiIovTR+FB+AX88rpFwnPett3L8/XYtef2ojjfYCHYM2wPDU8w3sL6q+jubffc+e89Y0PoZ43yDv0OchNZbMOo/Qx4rvxplH74aDjmFTTQQAN/jk/oy4uFQis9SQAAAABJRU5ErkJggg==>