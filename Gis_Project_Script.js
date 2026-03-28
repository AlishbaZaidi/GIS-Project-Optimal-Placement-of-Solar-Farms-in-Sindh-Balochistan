  // 1. Region of Interest (Sindh + Balochistan)
  var pakistan = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
    .filter(ee.Filter.eq('country_na', 'Pakistan'));
  
  // Define Sindh and Balochistan boundaries 
  var roi = ee.Geometry.Rectangle([60.5, 22.0, 70.5, 32.0]); // Sindh & Balochistan region
  var clipped = pakistan.geometry().intersection(roi, 1);
  
  // 2. Solar Radiation (MODIS)
  var solarRadiation = ee.ImageCollection("MODIS/061/MCD18A1")
    .select('DSR')
    .filterDate('2024-01-01', '2024-12-31')
    .mean()
    .clip(clipped); // Clip to Sindh and Balochistan
  
  // 3. Elevation
  var elevation = ee.Image("NASA/NASADEM_HGT/001")
    .select('elevation')
    .clip(clipped); // Clip to Sindh and Balochistan
  
  // 4. Land Use (ESA WorldCover)
  var landUse = ee.ImageCollection("ESA/WorldCover/v100")
    .first()
    .select('Map')
    .clip(clipped); // Clip to Sindh and Balochistan
  
  Map.centerObject(clipped,6);
  
  // Define the land cover classes by their corresponding numeric values.
  var treeCover = 10;      // Tree Cover
  var grassLand = 30;      // Grass Land
  var cropland = 40;       // Cropland
  var builtUp = 50;        // Built-up areas
  var bareSparse = 60;     // Bare/Sparse Vegetation
  var permanentWater = 80; // Permanent Water Bodies
  var smallWaters = 90;    // Herbaceous Wetlands
  var mangroves = 95;      // Mangroves
  
  // Negate the values of the specified land cover types
  var negTreeCover = landUse.eq(treeCover).multiply(-1);
  var negCropland = landUse.eq(cropland).multiply(-1);
  var negBuiltUp = landUse.eq(builtUp).multiply(-1);
  var negpermanentWaterBodies = landUse.eq(permanentWater).multiply(-1);
  var negmangroveAreas = landUse.eq(mangroves).multiply(-1);
  var negsmallWaters = landUse.eq(smallWaters).multiply(-1);
  
  // Keep Permanent Water Bodies and Mangroves without negation
  var BareSparse = landUse.eq(bareSparse);
  var GrassLand = landUse.eq(grassLand);
  
  // Sum the negated layers and include Permanent Water Bodies and Mangroves
  var sumLandUse = negTreeCover.add(negCropland).add(negBuiltUp).add(BareSparse).add(GrassLand)
                         .add(negpermanentWaterBodies).add(negmangroveAreas).add(negsmallWaters);
  
  // 5. Major Cities in Sindh + Balochistan
  var cities = ee.FeatureCollection([
    // Sindh
    ee.Feature(ee.Geometry.Point(67.0011, 24.8607), {name: 'Karachi'}),
    ee.Feature(ee.Geometry.Point(68.3578, 25.3960), {name: 'Hyderabad'}),
    ee.Feature(ee.Geometry.Point(67.9106, 24.7475), {name: 'Thatta'}),
    ee.Feature(ee.Geometry.Point(68.8228, 27.7244), {name: 'Sukkur'}),
    ee.Feature(ee.Geometry.Point(68.2028, 27.5570), {name: 'Larkana'}),
    ee.Feature(ee.Geometry.Point(69.8061, 24.7436), {name:'Mithi'}),
    // Balochistan
    ee.Feature(ee.Geometry.Point(66.9987, 30.1834), {name: 'Quetta'}),
    ee.Feature(ee.Geometry.Point(67.7169, 30.3939), {name: 'Ziarat'}),
    ee.Feature(ee.Geometry.Point(62.3250, 25.1313), {name: 'Gwadar'}),
    ee.Feature(ee.Geometry.Point(66.6057, 27.8165), {name: 'Khuzdar'}),
    ee.Feature(ee.Geometry.Point(63.0383, 26.0081), {name: 'Turbat'}),
    ee.Feature(ee.Geometry.Point(65.2679, 26.4749), {name: 'Awaran'}),
    ee.Feature(ee.Geometry.Point(64.3972, 28.8849), {name: 'Dalbandin'}),
    ee.Feature(ee.Geometry.Point(62.7500, 28.8259), {name: 'Nokkundi'}),
    ee.Feature(ee.Geometry.Point(69.4665, 31.3497), {name: 'Zhob'})
  ]);
  
  // // 6. Road Network 
  // var roads = ee.FeatureCollection("projects/ee-hakhuzaifa/assets/pakroads").filterBounds(clipped);
  
  // 7. UI Panel with Controls
  // Control Panel (Right Side)
  var panel = ui.Panel({
  style: {
    width: '320px',
    position: 'top-right',
    margin: '40px 20px 0 0',
    backgroundColor: 'rgba(255,255,255,0.9)'
  }
});
  panel.add(ui.Label('⚡ Solar Farm Suitability Tool for Sindh and Balochistan' , {fontWeight: 'bold', fontSize: '20px', margin: '10px 5px'}));
  
  panel.add(ui.Label('City Buffer Minimum (km):'));
  var cityBufferMinSlider = ui.Slider({
    min: 0, max: 100, step: 5, value: 55, style: {stretch: 'horizontal'}
  });
  panel.add(cityBufferMinSlider);
  
  panel.add(ui.Label('City Buffer Maximum (km):'));
  var cityBufferMaxSlider = ui.Slider({
    min: 10, max: 200, step: 5, value: 105, style: {stretch: 'horizontal'}
  });
  panel.add(cityBufferMaxSlider);
  
  // Label for showing error messages
  var errorLabel = ui.Label('', {color: 'red'});
  panel.add(errorLabel);
  
  // Validation function
  function validateBufferRange() {
    var min = cityBufferMinSlider.getValue();
    var max = cityBufferMaxSlider.getValue();
    if (max <= min) {
      errorLabel.setValue('Error: Maximum buffer cannot be less than or equal to minimum buffer.');
    } else {
      errorLabel.setValue('');
    }
  }
  
  // Attach validation to slider changes
  cityBufferMinSlider.onChange(validateBufferRange);
  cityBufferMaxSlider.onChange(validateBufferRange);

  
  // Solar Min Slider
  panel.add(ui.Label('Minimum Solar Radiation (W/m²):'));
  var solarMinSlider = ui.Slider({
    min: 550, max: 650, step: 10, value: 600, style: {stretch: 'horizontal'}
  });
  panel.add(solarMinSlider);
  
  // Solar Max Slider
  panel.add(ui.Label('Maximum Solar Radiation (W/m²):'));
  var solarMaxSlider = ui.Slider({
    min: 600, max: 800, step: 10, value: 700, style: {stretch: 'horizontal'}
  });
  panel.add(solarMaxSlider);
  
  // Tip Label
  panel.add(ui.Label(
    'Tip: Solar radiation values between 650–800 W/m² are generally considered productive.\n' +
    'Selecting values below 650 W/m² might result in areas with lower solar potential.'
  ));
  
  panel.add(ui.Label('Show Solar Radiation Layers:'));
  var showSolarLayersCheckbox = ui.Checkbox({
    label: 'Display Unsuitable Radiation',
    value: false,
    style: {margin: '5px'}
  });
  panel.add(showSolarLayersCheckbox);
  
  // Error label for solar radiation
  var solarErrorLabel = ui.Label('', {color: 'red'});
  panel.add(solarErrorLabel);
  
  // Validation function for solar range
  function validateSolarRange() {
    var min = solarMinSlider.getValue();
    var max = solarMaxSlider.getValue();
    if (max <= min) {
      solarErrorLabel.setValue('Error: Maximum solar radiation cannot be equal to minimum.');
    } else {
      solarErrorLabel.setValue('');
    }
  }
  
  // Attach validation to slider changes
  solarMinSlider.onChange(validateSolarRange);
  solarMaxSlider.onChange(validateSolarRange);

  // Add sliders for weightages
  panel.add(ui.Label('Weight for Solar Radiation:'));
  var solarWeightSlider = ui.Slider({
    min: 0, 
    max: 1, 
    step: 0.1, // Change step to 0.1 for single decimal
    value: 0.4,
    style: {stretch: 'horizontal'}
  });
  
  panel.add(solarWeightSlider);

  
  panel.add(ui.Label('Weight for Land Use:'));
  var landUseWeightSlider = ui.Slider({
    min: 0, 
    max: 1, 
    step: 0.1, // Change step to 0.1
    value: 0.3,
    style: {stretch: 'horizontal'}
  });
  panel.add(landUseWeightSlider);
  
  panel.add(ui.Label('Weight for Elevation:'));
  var elevationWeightSlider = ui.Slider({
    min: 0, 
    max: 1, 
    step: 0.1, // Change step to 0.1
    value: 0.3,
    style: {stretch: 'horizontal'}
  });
  panel.add(elevationWeightSlider);

  panel.add(ui.Label('Tip: Add weightages according to your needs (just make sure they add up to 1) \n'));
  
  // Flag to control whether to update the map
  var shouldUpdateMap = false;
  
  function formatWeight(value) {
  return Number(value.toFixed(1)); // Truncate to 1 decimal
}
  
  // Function to check if the weight sum is valid before map update
  function updateWeights() {
    var solar = formatWeight(solarWeightSlider.getValue());
    var landUse = formatWeight(landUseWeightSlider.getValue());
    var elevation = formatWeight(elevationWeightSlider.getValue());
    
    var totalWeight = solar + landUse + elevation;
    // If the sum exceeds 1, show an alert and stop further action
    if (totalWeight > 1) {
      alert("The sum of the weights cannot exceed 1. Please adjust the sliders.");
      shouldUpdateMap = false;  // Prevent map update
      return;  // Prevent the map update and stop the event
    }
  
    shouldUpdateMap = true; // Allow map update
  }
  
  // Handle slider changes and check if the map update is allowed
  solarWeightSlider.onChange(updateWeights);
  landUseWeightSlider.onChange(updateWeights);
  elevationWeightSlider.onChange(updateWeights);
  
  // Add a button to generate the suitability map
  var generateBtn = ui.Button({
    label: 'Generate Suitability Map',
    style: {margin: '10px', width: '200px'},
    onClick: function() {
      if (!shouldUpdateMap) {
        return;  // Don't update the map if the weights are invalid
      }
  
      updateMap();  // Proceed with the map update if the weights are valid
    }
  });
  panel.add(generateBtn);
  
  
  
  // Intro panel
  var introPanel = ui.Panel({
    style: {
      width: '350px',
      padding: '10px',
      position: 'bottom-center',
      backgroundColor: 'rgba(255,255,255,0.95)',
      shown: true  // Make sure the intro panel is shown at the start
    }
  });
  introPanel.add(ui.Label({
    value: '⚡ Solar Farm Suitability Tool for Sindh and Balochistan',
    style: {fontWeight: 'bold', fontSize: '22px', margin: '10px'}
  }));
  
  introPanel.add(ui.Label(
    '\nProject Overview:\n\nThis tool is designed to help identify the most suitable locations for solar farm development in the Sindh and Balochistan regions of Pakistan. It combines several factors such as:\n\n' +
    '• Solar Radiation: Areas with optimal solar energy potential.\n' +
    '• Accessibility: Proximity to Major Cities.\n' +
    '• Elevation: Suitable terrain for solar panel installation.\n' +
    '• Land Use: Avoiding built-up areas, croplands, and forests.\n\n' +
    'Suitability Scores (0-1):\n' +
    '- 0.8–1.0: Optimal (Dark Green)\n' +
    '- 0.6–0.8: High Potential (Light Green)\n' +
    '- 0.4–0.6: Moderate (Yellow)\n' +
    '- 0.2–0.4: Low (Light Red)\n' +
    '- 0.0–0.2: Unsuitable (Dark Red)\n\n' +
    'The final score is calculated using weighted combinations of these factors. ' +
    'Adjust the sliders to prioritize different criteria and explore how it affects suitable locations.'
  ));
  
  introPanel.add(ui.Label(
    'Instructions:\n\n• Use the sliders on the left panel to set:\n  - Accessibility range (distance from major cities)\n  - Minimum & Maximum Solar Radiation (W/m²)\n\n• Areas within range and suitable radiation will appear green on map.\n\nClick OK to start!'
  ));
  
  introPanel.add(ui.Label('Project by: Syeda Alishba Zaidi, Huzaifa Ahmed Khan, Aamaina Mukarram'));
  
  // OK button to close the intro panel
  var okButton = ui.Button({
    label: 'OK, got it!',
    style: {margin: '10px'},
    onClick: function() {
    introPanel.style().set('shown', false);// Hide the intro panel when OK is clicked
    updateMap();
    }
  });
  introPanel.add(okButton);
  
  // Add the "Show Instructions" button to the main panel
  var showInstructionsBtn = ui.Button({
    label: 'Show Instructions',
    style: {margin: '10px', width: '200px'},
    onClick: function() {
      introPanel.style().set('shown', true);  // Show the intro panel
    }
  });
  
  panel.add(showInstructionsBtn);
  
  // Create a gradient image based on the color palette
  var colorGradient = ee.Image.pixelLonLat()
    .select(['longitude'])
    .subtract(60)  // Adjust this to fit the region's longitude range
    .divide(10)
    .mod(1)
    .multiply(4)  // Adjust to match the number of colors in your palette
    .floor()
    .toInt();
  
    // Color Legend (Map Overlay)
   var legend = ui.Panel({
    layout: ui.Panel.Layout.Flow('vertical'),
    style: {
      position: 'bottom-left',
      width: '160px',
      padding: '8px',
      margin: '0 0 40px 20px',
      backgroundColor: 'rgba(255,255,255,0.9)'
    }
  });
  
  legend.add(ui.Label('Suitability Score', {fontWeight: 'bold', fontSize: '13px'}));
  
  [
    ['#8B0000', '0.0-0.2 (Unsuitable)'],
    ['#FF7F7F', '0.2-0.4 (Low)'],
    ['#FFFF00', '0.4-0.6 (Moderate)'],
    ['#90EE90', '0.6-0.8 (High)'],
    ['#006400', '0.8-1.0 (Optimal)']
  ].forEach(function(item) {
    var row = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
    
    // CORRECTED LINE: Remove nested 'style' property
    row.add(ui.Label('⬤', {
      color: item[0],          // Direct style properties
      fontSize: '20px',
      margin: '0 5px 0 0'
    }));
    
    row.add(ui.Label(item[1], {fontSize: '12px'}));
    legend.add(row);
  });
  
  
  // === 4. MAIN FUNCTION ===
  function updateMap() {
    Map.layers().forEach(function(layer) {
    if (layer.getName() !== 'legend') { // Keep legend layer
      Map.remove(layer);
    }});
  
    var solarMin = solarMinSlider.getValue();
    var solarMax = solarMaxSlider.getValue();
  
    var cityBufferMin = cityBufferMinSlider.getValue() * 1000;
    var cityBufferMax = cityBufferMaxSlider.getValue() * 1000;
  
    // Create union of all max buffers (as geometry)
    var maxBuffers = cities.map(function(city) {
      return city.buffer(cityBufferMax);
    }).union().geometry(); // Convert to geometry
  
    // Create union of all min buffers (as geometry)
    var minBuffers = cities.map(function(city) {
      return city.buffer(cityBufferMin);
    }).union().geometry(); // Convert to geometry
  
    // Subtract min buffers from max buffers (geometry operation)
    var suitableBuffer = maxBuffers.difference(minBuffers);
  
    // Create buffer image from geometry
    var cityBufferImg = ee.Image().byte().paint(suitableBuffer, 1).clip(clipped);
  
    var solarMask = solarRadiation.gte(solarMin).and(solarRadiation.lte(solarMax));

  
    // Normalize the layers to range [0, 1] for visualization
    var solarNorm = solarRadiation.unitScale(200, 700); // Normalize solar radiation to [0, 1]
    var landUseNorm = sumLandUse.subtract(-4).divide(2 - (-4)); // Normalize land use
    var elevationNorm = elevation.subtract(0).divide(1500 - 0); // Normalize the elevation
  
    var solarWeight = solarWeightSlider.getValue();
    var landUseWeight = landUseWeightSlider.getValue();
    var elevationWeight = elevationWeightSlider.getValue();
  
    var totalWeight = solarWeight + landUseWeight + elevationWeight;
    solarWeight /= totalWeight;
    landUseWeight /= totalWeight;
    elevationWeight /= totalWeight;
  
    // Remove masking for low values (if any)
    var suitability = cityBufferImg.multiply(
      solarNorm.multiply(solarWeight)
        .add(landUseNorm.multiply(landUseWeight))
        .add(elevationNorm.multiply(elevationWeight))
    ).clip(clipped); // No masking here

    // Custom color palette for solar radiation
   // var colorPalette = ['#8B0000', '#FF7F7F', '#FFFF00', '#90EE90', '#006400'];
  
    // Modify the suitability visualization to show 0–1 range
    var suitabilityVisualized = suitability.visualize({
      min: 0, 
      max: 1, 
      palette: ['#8B0000', '#FF7F7F', '#FFFF00', '#90EE90', '#006400'] // Full gradient
    })
  
    // Mark regions with radiation below 450 as light red
    var lightRedRegion = solarRadiation.lt(650).selfMask().visualize({
      palette: ['#FF7F7F'], 
      min: 0, 
      max: 1
    });
  
    // Mark regions with radiation below 225 as dark red
    var darkRedRegion = solarRadiation.lt(620).selfMask().visualize({
      palette: ['#8B0000'], 
      min: 0, 
      max: 1
    });
  
    // Add layers to the map
    Map.centerObject(clipped, 6);
    
    // Add suitability layer and cities by default
    Map.addLayer(suitabilityVisualized, {}, 'Solar Suitability');
    Map.addLayer(cities, {color: 'blue'}, 'Cities');
    
    if (showSolarLayersCheckbox.getValue()) {
    Map.addLayer(lightRedRegion, {}, 'Radiation < 650 W/m²');
    Map.addLayer(darkRedRegion, {}, 'Radiation < 620 W/m²'); }
    // Add city buffers layer
    // Map.addLayer(cityBuffer, {color: 'purple', width: 2}, 'City Buffers');
  }
  
  // Add the UI panel to the map
  ui.root.add(panel);
  ui.root.add(introPanel);
  Map.add(legend);
