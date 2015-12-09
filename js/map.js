function callMap(pUrl, fUrl, furlIt){

  var tooltip= CustomTooltip("bubbles_tooltip");
  var svg, meshData, scale, circles, radius1, radius2, countryLabs, labelData, nest,
  formatNumber = d3.format(",.0f");
  var selectedMonth, selMnthSlid;
  var delay = function(d, i) { return i * 50; };
  var mapData, circlesData1, circlesData2;
  var dates = [];
  var placeholder = d3.select(".l-box.flows:not(.full)").classed("full",true);//$(".lbox.flows").not(".full").addClass( "full" );
  placeholder.append("span").attr("id", "slider-step-value");
  placeholder.append("div").attr("id", "map");
  placeholder.append("div").attr("id", "playBtn");
  placeholder.append("div").attr("id", "slider-step");
$(document).ready(function(){
  var width = $("#map").width();
  var height, mapMarginLeft, mapScale, mapTranslate, mapBackgr;
  if(pUrl == fUrl || pUrl == furlIt){
    height = $("#map").width()*0.70;
    mapMarginLeft = 15;
    mapScale = width * 2.76872536;
    mapTranslate = [(width/-3.16555) - mapMarginLeft, height * 3.60020];
    mapBackgr = "map_backgr.png";
  }
  else {
    height = $("#map").width()*0.55;
    mapMarginLeft = 30;
     mapScale = width * 2.352433;//2997;
     mapTranslate = [(width/-3.55) - mapMarginLeft, height * 3.893249607];//; //[-358.00, 2728.00];
     mapBackgr = "test_rob.png";
  }
  

  var projection = d3.geo.robinson()
          .scale(mapScale)
          .translate(mapTranslate);

  var path = d3.geo.path()
          .projection(projection);

  function sliderInit(curMonth){
    $('#slider-step').noUiSlider({
      start: dates.length - 1,
      step: 1,
      range: {
        'min': [  0 ],
        'max': dates.length -1 
      }
    });


    $("#slider-step").noUiSlider_pips({
      mode: 'values',
      values: [0, dates.length - curMonth],
      density: 4.5
    });
    //$( "div.noUi-value-large:contains('"+ dates.length - 25 +"')" ).html('2013');
    $( "div.noUi-value-large:contains("+ (0) +")" ).html('2014');
    $( "div.noUi-value-large:contains("+ (dates.length - curMonth) +")" ).html('2015');
  }


  function sizeChangeMap() {
        
        d3.select(".flows.intro").style({
          "min-height": d3.select(".chart.flows.full").node().offsetLeft > 50 ? d3.select(".chart.flows.full").style("height"):"300px"
        })
  }
  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
  
//DATA LOADING
d3.json("http://data.unhcr.org/api/stats/mediterranean/monthly_arrivals_by_location.json", function(data) {
  circlesData1 = data;
  nest = d3.nest()
    .key(function(d) { return d.location; })
    .entries(data);

  for (var i = 0; i < data.length; i++){
    if(data[i].location == "Lesvos"){
      var mnth = data[i].month_en;
      var yr = data[i].year;
      var date = mnth + " " + yr.toString();
      dates.push(date);
    }
  }
  var currentMonth = getMonthFromString(dates[dates.length - 1].split(" ")[0]);
  sliderInit(currentMonth);
  d3.json("js/data.json", function(error, world) {
      if (error) return console.error(error);
      mapData = topojson.feature(world, world.objects.countries);
      meshData = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; });
      labelData = topojson.feature(world, world.objects.countries).features;
      drawMap(circlesData1);
      
      //drawMap(2, 460, mapTranslate2, circlesData2);
      
  });
});


function drawMap(circlesData) {
      projection
        .scale(mapScale)
        .translate(mapTranslate);

      svg = d3.select("#map").append("svg")
        .attr("id", "mapSvg")
        .attr("width", width - mapMarginLeft)
        .attr("height", height);

      svg.append("path")
        .datum(mapData)
        .attr("id", "feature")
        .attr("d", path);

      svg.append("clipPath")
          .attr("id", "clip")
        .append("use")
          .attr("xlink:href", "#feature");

      svg.append("image")
          .attr("clip-path", "url(#clip)")
          .attr("xlink:href", mapBackgr)
          .attr("width", width + (width * 0.07849))
          .attr("height", height)
          .attr("x", function() { return pUrl == fUrl || pUrl == furlIt ? -mapMarginLeft -5 : -mapMarginLeft;} );

      svg.append("path")
        .datum(meshData)
        .attr("class", "mesh")
        .attr("d", path);

      drawCircles(circlesData);
        
      function drawCircles(data){
        selMnthSlid = dates.length-1;
        // console.log(dates[selMnthSlid]);
        d3.select("#slider-step-value").html(dates[selMnthSlid]);
        //d3.select("#slider-step-value2").html(dates[selectedMonth]);

        circles = svg.append("g")
            .attr("id", "circles");


        var radius = d3.scale.sqrt();
        radius1 = radius
          .domain([0, d3.max(data, function(d){return d.value})])
          .range([0, (width * 4.5)/100]);

        circles.selectAll("circle")
          .data(nest, function(d){return d.key;})//(data.filter(function(d) { return d.month == selectedMonth && d.year == selectedYear ? d : ""; }))
        .enter()
        .append("circle")
          .attr("id", function(d){ return d.values[0].country; })
          .attr("cx", function(d, i) { return projection([+d.values[0].location_longitude,+d.values[0].location_latitude])[0]; })
          .attr("cy", function(d, i) { return projection([+d.values[0].location_longitude,+d.values[0].location_latitude])[1]; })
          .attr("r",  function(d) { return typeof d.values[selMnthSlid] != "undefined" ? radius1(d.values[selMnthSlid].value) : radius1(0); })
          .on("mouseover", function(d, i) {
              d3.select(this).style("fill", "rgba(252, 182, 21, 0.7)");
              show_details(d, i, this);})
          .on("mouseout", function(d) {
              d3.select(this).style("fill","#fcb615");
              tooltip.hideTooltip();});

        countryLabs = d3.select("#mapSvg").append("g").attr("class", "labels");

        countryLabs.selectAll("labels")
          .data(labelData)
        .enter()
        .append("text")
            .attr("x", function(d){return path.centroid(d)[0];})
            .attr("y", function(d){ return d.properties.name == "Croatia" ? path.centroid(d)[1] - 15 : path.centroid(d)[1] ;})
            .attr("dy", "0.3em")
            .attr("text-anchor", "middle")
            .attr("class", "label")
            .text(function(d) { 
              if(d.properties.name == "Malta" || d.properties.name == "Tunisia" || d.properties.name == "Kosovo" || d.properties.name == "Cyprus" || d.properties.name == "Slovenia"){
                return;
              }
              else return d.properties.name;
            })
            .call(wrap, 90);

          d3.select(".flows.intro").style({
            "min-height": d3.select(".chart.flows.full").style("height")
          })
        
      }

      function show_details(data, i, element) {
        var selectorId = data.id;
        d3.select("#circles").select("circle#" + selectorId).moveToFront().style("fill", "rgba(252, 182, 21, 0.7)");
        // console.log(data.location);
        var tipContent = "<div class=\"tipCountry\"> " + data.key + "</div>";
        tipContent +="<div class=\"tipArriv\"> " + formatNumber(data.values[selMnthSlid].value) + "</div>";
        tooltip.showTooltip(tipContent, d3.event);
      }
       
      function hide_details(data, i, element) {
        var selectorId = data.id;
        d3.select("circle#" + selectorId).style("fill", "#fcb615");
        tooltip.hideTooltip();
        d3.selectAll(".closed").moveToFront();
      }
  }
  
  $('#playBtn').on('click', function(){

    if(selMnthSlid == dates.length - 1) {
      selMnthSlid = -1;
    }

    var intrvl = setInterval(function () {

      if(selMnthSlid < dates.length - 1){
          var sliderVal = (selMnthSlid + 1).toString();
          $('#slider-step').val(sliderVal);
          selMnthSlid = selMnthSlid + 1;
          d3.select("#slider-step-value").html(dates[selMnthSlid]);
          d3.select("#slider-step-value2").html(dates[selMnthSlid]);
          redraw();
      }
      else if(selMnthSlid >= dates.length - 1) {clearInterval(intrvl);}
      }, 500);
    
  });

  function onSlide(){
    selMnthSlid = parseInt($(this).val());
    d3.select("#slider-step-value").html(dates[selMnthSlid]);
    //d3.select("#slider-step-value2").html(dates[selectedMonth]);
    redraw();
  }

  $('#slider-step').on('slide', onSlide);

  function redraw(){
    var selection = d3.select("#circles").selectAll("circle");
    selection
    .transition()
          .duration(500).ease("linear")
          .attr("r",  function(d) { return typeof d.values[selMnthSlid] != "undefined" ? radius1(d.values[selMnthSlid].value) : radius1(0); });
  }


function getMonthFromString(mon){
   return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
}

 //LINES BREAK FUNCTION
  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          x = text.attr("x"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

});
  
}