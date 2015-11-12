  var tooltip= CustomTooltip("bubbles_tooltip");
  var svg,width,height, projection, path, scale, circles, radius1, radius2, countryLabs,
  formatNumber = d3.format(",.0f");
  var selectedMonth, selMnthSlid;
  var delay = function(d, i) { return i * 50; };
  var mapData, circlesData1, circlesData2;
  var dates = [];
  var placeholder = d3.select(".l-box.flows:not(.full)").classed("full",true);//$(".lbox.flows").not(".full").addClass( "full" );
  placeholder.append("span").attr("id", "slider-step-value");
  placeholder.append("div").attr("id", "map_1");
  placeholder.append("div").attr("id", "playBtn");
  placeholder.append("div").attr("id", "slider-step");
$(document).ready(function(){

/*  placeholder.append("<span id='slider-step-value'></span>");
  placeholder.append("<div id='map_1'></div>");

  placeholder.append("<div id='playBtn'></div>");
  placeholder.append("<div id='slider-step'></div>");
  placeholder.append("<div class='note'>Source: <a href='http://data.unhcr.org/syrianrefugees/regional.php' target='_blank'>UNHCR</a></div>");
*/
  //placeholder.append("<div id='map2'></div>");

  function sliderInit(curMonth){
    $('#slider-step').noUiSlider({
      start: dates.length - 2,
      step: 1,
      range: {
        'min': [  0 ],
        'max': dates.length - 1
      }
    });


    $("#slider-step").noUiSlider_pips({
      mode: 'values',
      values: [dates.length - curMonth - 2, dates.length - 1],
      density: 5
    });
    //$( "div.noUi-value-large:contains('"+ dates.length - 25 +"')" ).html('2013');
    $( "div.noUi-value-large:contains("+ (dates.length - curMonth - 2) +")" ).html('2014');
    $( "div.noUi-value-large:contains("+ (dates.length - 1) +")" ).html('2015');
  }


  function sizeChange() {
        d3.select("g.world1").attr("transform", "scale(" + $("#map_1").width()/480 + ")");
        d3.select("g.labels").attr("transform", "scale(" + $("#map_1").width()/480 + ")");
        //d3.select("g.world2").attr("transform", "scale(" + $("#map_2").width()/480 + ")");
        $("#mapSvg_1").height($("#map_1").width()*0.55);
        $("#mapSvg_1").width($("#map_1").width());
        //$("#mapSvg_2").height($("#map_2").width()*0.35);
        //$("#mapSvg_2").width($("#map_2").width());
  }
  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
  
//DATA LOADING
d3.json("http://data.unhcr.org/api/stats/mediterranean/monthly_arrivals_by_location.json", function(data) {
  circlesData1 = data;
  console.log(data);
  for (var i = 0; i < data.length; i++){
    if(data[i].location == "Lesvos"){
      var mnth = data[i].month_en;
      var yr = data[i].year;
      var date = mnth + " " + yr.toString();
      dates.push(date);
    }
  }
  var currentMonth = data[data.length - 1].month;
  sliderInit(currentMonth);
  d3.json("js/data.json", function(error, world) {
      if (error) return console.error(error);
      mapData = topojson.feature(world, world.objects.countries).features;
      var mapTranslate1 = [-120, 990];
      //var mapTranslate2 = [60, 380];
      drawMap(1, 1080, mapTranslate1, circlesData1);
      //drawMap(2, 460, mapTranslate2, circlesData2);
      
  });
});


function drawMap(mapNum, mapScale, mapTranslate, circlesData) {
      width = $("#map_" + mapNum).width();
      if(mapNum === 1){
        height = $("#map_" + mapNum).width()*0.55;
      }
      else { height = $("#map_" + mapNum).width()*0.35; }
      
      d3.select(window)
        .on("resize", sizeChange);

      projection = d3.geo.robinson()
      .scale(mapScale)
      .translate(mapTranslate);

      path = d3.geo.path()
          .projection(projection);

      svg = d3.select("#map_" + mapNum).append("svg")
        .attr("id", "mapSvg_" + mapNum)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("class", "world" + mapNum)
        .attr("transform", "scale(" + $("#map_" + mapNum).width()/480 + ")");

      svg.selectAll(".country")
        .data(mapData)
      .enter().append("path")
        .attr("class", "country" + mapNum)
        .attr("id", function(d) { return d.id; })
        .attr("d", path)
        .attr("stroke", "#fff");
        //.on("click", clicked);
        drawCircles(circlesData);
        
      function drawCircles(data){
        selectedMonth = data[data.length - 1].month;
        var selectedYear = data[data.length - 1].year;
        selMnthSlid = dates.length-2;
        console.log(dates[selMnthSlid]);
        d3.select("#slider-step-value").html(dates[selMnthSlid]);
        //d3.select("#slider-step-value2").html(dates[selectedMonth]);

        circles = svg.append("g")
            .attr("id", "circles" + mapNum);


        var radius = d3.scale.sqrt();
        radius1 = radius
          .domain([0, d3.max(data, function(d){return d.value})])
          .range([0, 30]);

        circles.selectAll("circle")
          .data(data.filter(function(d) { return d.month == selectedMonth && d.year == selectedYear ? d : ""; }))
        .enter()
        .append("circle")
          .attr("id", function(d){ return d.location; })
          .attr("cx", function(d, i) { return projection([+d.location_longitude,+d.location_latitude])[0]; })
          .attr("cy", function(d, i) { return projection([+d.location_longitude,+d.location_latitude])[1]; })
          .attr("r",  function(d) { return radius1(d.value); })
          .on("mouseover", function(d, i) {
              d3.select(this).style("fill", "rgba(252, 182, 21, 0.7)");
              show_details(d, i, this, mapNum);})
          .on("mouseout", function(d) {
              d3.select(this).style("fill","#fcb615");
              tooltip.hideTooltip();});

        countryLabs = d3.select("#mapSvg_1").append("g").attr("class", "labels").attr("transform", "scale(" + $("#map_" + mapNum).width()/480 + ")");;

        countryLabs.selectAll("labels")
          .data(mapData)
        .enter()
        .append("text")
            .attr("x", function(d){return path.centroid(d)[0];})
            .attr("y", function(d){ return d.properties.name == "Croatia" ? path.centroid(d)[1] - 5 : path.centroid(d)[1] ;})
            .attr("dy", "0.3em")
            .attr("text-anchor", "middle")
            .attr("class", "label")
            .text(function(d) { 
              if(d.properties.name == "Malta" || d.properties.name == "Tunisia" || d.properties.name == "Kosovo"){
                return;
              }
              else return d.properties.name;
            })
            .call(wrap, 70);
        
      }

      function show_details(data, i, element, indx) {
        var selectorId = data.id;
        d3.select("#circles" + indx).select("circle#" + selectorId).moveToFront().style("fill", "rgba(252, 182, 21, 0.7)");
        console.log(data.location);
        var tipContent = "<div class=\"tipCountry\"> " + data.location + "</div>";
        tipContent +="<div class=\"tipArriv\"> " + formatNumber(data.value) + "</div>";
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
          var dat = dates[selMnthSlid].split(" ");
          redraw(dat[0], dat[1]);
      }
      else if(selMnthSlid >= dates.length - 1) {clearInterval(intrvl);}
      }, 500);
    
  });

  function onSlide(){
    selMnthSlid = parseInt($(this).val());
    d3.select("#slider-step-value").html(dates[selMnthSlid]);
    //d3.select("#slider-step-value2").html(dates[selectedMonth]);
    var dat = dates[selMnthSlid].split(" ");
    redraw(dat[0], dat[1]);
  }

  $('#slider-step').on('slide', onSlide);

  function redraw(month, year) {
      var selection = d3.select("#circles1").selectAll("circle");
      var updatedData = circlesData1.filter(function(d) {
        if(d.month_en == month && d.year == year){
          return d;
        }
      });

      //QUICK FIX FOR UNCHR API BUG SHOULD BE CHANGED
      var injection = {
        country: "SPA",
        country_en: "Spain",
        last_updated: 1443564000,
        location: "Mainland Andalucia",
        location_latitude: 40.4169,
        location_longitude: -3.7036,
        location_total: 2339,
        month: 9,
        month_en: "September",
        value: 0,
        year: 2015
      };
      if(updatedData.length < 22){
        for(var i = 5; i < 9; i++){
          updatedData.splice(i+1, 0, injection);
        }
        updatedData.splice(16, 0, injection);
        updatedData.splice(18, 0, injection);
        updatedData.splice(19, 0, injection);
        updatedData.splice(21, 0, injection);
      }

      selection
      .data(updatedData)
      .transition()
            .duration(500).ease("linear")
            .attr("r",  function(d) { return radius1(d.value); });
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