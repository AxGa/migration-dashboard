var dataHost;
var forma = d3.format("s");
var format = d3.format(",d");
function initDemographics(){
	d3.csv("data/demographics.csv", function(error, data){
		data = d3.nest()
			.key(function(d){ return d.country})
			.map(data);
        var container = d3.select(".l-box.demographics:not(.full)");
        var typeOfCountry = "origin";
		initPyramid(data, container, typeOfCountry);
	})

    d3.csv("data/demographics_host.csv", function(error, data){
        dataHost = d3.nest()
            .key(function(d){ return d.country})
            .map(data);
        var container = d3.select(".l-box.demographics:not(.full)");
        var typeOfCountry = "host";
        initPyramid(dataHost, container, typeOfCountry);
    })

	function initPyramid(data, container, typeOfCountry){
		var bisectDate = d3.bisector(function(d) { return d.age; }).left;
        var margin = {top: 20, right: 10, bottom: 20, left: 10},
            width = $(".l-box.demographics:not(.full)").width() - margin.left - margin.right,
            height = 305 - margin.top - margin.bottom;

        container.append("div").attr("class", "titleYel").html(function(){ return typeOfCountry == "origin" ? "Asylum seekers demographics 2015" : "Host country demographics 2014";}).style("margin-top", "0");
        
       	//------------ COUNTRIES LIST SELECTION --------------//
        if(typeOfCountry == "origin"){
            container.append("select").attr("id", "country").attr("class", "select-ctrl").attr("name", "country");
            populateCountries("country");
            var e = document.getElementById("country");
            
            $( "select" )
              .change(function () {
                var selectedCountry = e.options[e.selectedIndex].text;
                updateArea(selectedCountry);
              });
        }

		var country = "Austria";

        var svg = container.classed("full", true)
          .append("svg")
            .attr("id", typeOfCountry)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var yLeft = d3.scale.ordinal()
            .domain(data[country].map(function(d) { return d.age; }))
            .rangeRoundPoints([height, 0], .5);

        var yLeftAxis = d3.svg.axis()
            .scale(yLeft)
            .orient("right");

        svg.append("g")
            .attr("class", "y axis demographics")
            .attr("transform", "translate(" + width/2 + ", 0)")
            .style("text-anchor", "middle")
            .call(yLeftAxis);

        var yRight = d3.scale.ordinal()
            .domain(data[country].map(function(d) { return d.age; }))
            .rangeRoundPoints([height, 0], .5);

        var yRightAxis = d3.svg.axis()
            .scale(yRight)
            .orient("right")
            .tickFormat("");

        var gAxis = d3.select(".y.axis.demographics").node().getBBox();

        var xLeft = d3.scale.linear()
            .domain([0, d3.max(data[country], function(d) { return +d.male; })])
            .range([(width/2)-(gAxis.width/2), 0]);

        var xLeftAxis = d3.svg.axis()
            .scale(xLeft)
            .ticks(3)
            .orient("bottom")
            .tickFormat(function(d) { return forma(d).replace(/G/, 'bn'); });

        var xRight = d3.scale.linear()
            .domain([0, d3.max(data[country], function(d) { return +d.male; })])
            .range([(width/2)+(gAxis.width), width]);

        var xRightAxis = d3.svg.axis()
            .scale(xRight)
            .ticks(3)
            .orient("bottom")
            .tickFormat(function(d) { return forma(d).replace(/G/, 'bn'); });


        var areaL = d3.svg.area()
            .y(function(d) { return yLeft(d.age); })
            .x0((width/2)-(gAxis.width/2))
            .x1(function(d) { return xLeft(d.male); });

        var areaR = d3.svg.area()
            .y(function(d) { return yRight(d.age); })
            .x0((width/2)+(gAxis.width))
            .x1(function(d) { return xRight(d.female); });
        

        svg.append("path")
            .datum(data[country])
            .attr("class", "areaL")
            .attr("d", areaL);

        svg.append("path")
            .datum(data[country])
            .attr("class", "areaR")
            .attr("d", areaR);

        svg.selectAll("texts")
            .data(data[country])
          .enter().append("text")
            .attr("class", "num")
            .text(function(d){ return format(d.male); })
            .attr("x", function(d){ return xLeft(d.male) - 6; })
            .attr("y", function(d){ return yLeft(d.age) - 6; })
            .attr("text-anchor", function(d){
                return this.getBBox().x > 0 ? "end" : "start";
            });

        svg.selectAll("textsF")
            .data(data[country])
          .enter().append("text")
            .attr("class", "numFem")
            .text(function(d){ return format(d.female); })
            .attr("x", function(d){ return xRight(d.female) + 6; })
            .attr("y", function(d){ return yLeft(d.age) - 6; })
            .attr("text-anchor", function(d){
                return this.getBBox().x > width ? "end" : "start";
            });

        svg.append("g")
            .attr("class", "x axis demoL")
            .attr("transform", "translate(0," + height + ")")
            .call(xLeftAxis);

        svg.append("g")
            .attr("class", "x axis demoR")
            .attr("transform", "translate(0," + height + ")")
            .call(xRightAxis);

		function updateArea(cntry){
	        //ORIGIN
            yLeft.domain(data[cntry].map(function(d) { return d.age; }));
            yRight.domain(data[cntry].map(function(d) { return d.age; }));
            xLeft.domain([0, d3.max(data[cntry], function(d) { return +d.male; })]);
            xRight.domain([0, d3.max(data[cntry], function(d) { return +d.male; })]);

            d3.select("#origin").select("g.y.axis.demographics").call(yLeftAxis);
            d3.select("#origin").select(".areaL").datum(data[cntry]).transition().duration(300).attr("d", areaL);
            d3.select("#origin").select(".areaR").datum(data[cntry]).transition().duration(300).attr("d", areaR);
            d3.select("#origin").select(".x.axis.demoL").call(xLeftAxis);
            d3.select("#origin").select(".x.axis.demoR").call(xRightAxis);
            d3.select("#origin").selectAll(".num")
                .data(data[cntry])
                .text(function(d){ return format(d.male); })
                .transition().duration(300)
                .attr("x", function(d){ return xLeft(d.male) - 6; })
                .attr("text-anchor", function(d){
                    return this.getBBox().x - this.getBBox().width > 0 ? "end" : "start";
                });
            d3.select("#origin").selectAll(".numFem")
                .data(data[cntry])
                .text(function(d){ return format(d.female); })
                .transition().duration(300)
                .attr("x", function(d){ return xRight(d.female) + 6; })
                .attr("text-anchor", function(d){
                    return this.getBBox().x > width ? "end" : "start";
                });

            //HOST
            yLeft.domain(dataHost[cntry].map(function(d) { return d.age; }));
            yRight.domain(dataHost[cntry].map(function(d) { return d.age; }));
            xLeft.domain([0, d3.max(dataHost[cntry], function(d) { return +d.male > +d.female ? +d.male : +d.female; })]);
            xRight.domain([0, d3.max(dataHost[cntry], function(d) { return +d.male > +d.female ? +d.male : +d.female; })]);

	        d3.select("#host").select("g.y.axis.demographics").call(yLeftAxis);
	        d3.select("#host").select(".areaL").datum(dataHost[cntry]).transition().duration(300).attr("d", areaL);
	        d3.select("#host").select(".areaR").datum(dataHost[cntry]).transition().duration(300).attr("d", areaR);
	        d3.select("#host").select(".x.axis.demoL").call(xLeftAxis);
	        d3.select("#host").select(".x.axis.demoR").call(xRightAxis);
            d3.select("#host").selectAll(".num")
                .data(dataHost[cntry])
                .text(function(d){ return format(d.male); })
                .transition().duration(300)
                .attr("x", function(d){ return xLeft(d.male) - 6; })
                .attr("text-anchor", function(d){
                    return this.getBBox().x - this.getBBox().width > 0 ? "end" : "start";
                });
            d3.select("#host").selectAll(".numFem")
                .data(dataHost[cntry])
                .text(function(d){ return format(d.female); })
                .transition().duration(300)
                .attr("x", function(d){ return xRight(d.female) + 6; })
                .attr("text-anchor", function(d){
                    return this.getBBox().x + this.getBBox().width > width ? "end" : "start";
                });
            country = cntry;
	   }

	      //--------MOUSEOVER THE CHARTS----------
	      var focus = svg.append("g")
	          .attr("class", "focus")
              .attr("id", function(){ return typeOfCountry == "origin" ? "focusOr" : "focusHo"})
	          .style("display", "none");

	      focus.append("circle")
	          .attr("r", 5.5);

            var focusFem = svg.append("g")
                  .attr("class", "focus")
                  .attr("id", function(){ return typeOfCountry == "origin" ? "focusFemOr" : "focusFemHo"})
                  .style("display", "none");

              focusFem.append("circle")
                  .attr("r", 5.5);

	      // console.log("infobox");
	      svg.append("rect")
	          .attr("class", "overlay")
	          .attr("width", width)
	          .attr("height", height)
	          .on("mouseover", function() { 
                focus.style("display", null);
                focusFem.style("display", null);
            })
	          .on("mouseout", function() { d3.selectAll(".focus").style("display", "none"); })
	          .on("mousemove", mousemove)
	          .on("click", mousemove);


	      //focus.attr("transform", "translate(" + 1.5 + "," + y(3800000) + ")");
	      function mousemove() {
            country = $( "select#country" ).val();

            if (typeOfCountry == "origin"){
                yLeft.domain(data[country].map(function(d) { return d.age; }));
                xLeft.domain([0, d3.max(data[country], function(d) { return +d.male; })]);
                xRight.domain([0, d3.max(data[country], function(d) { return +d.male; })]);
            }
            else{
                yLeft.domain(dataHost[country].map(function(d) { return d.age; }));
                xLeft.domain([0, d3.max(dataHost[country], function(d) { return +d.male > +d.female ? +d.male : +d.female; })]);
                xRight.domain([0, d3.max(dataHost[country], function(d) { return +d.male > +d.female ? +d.male : +d.female; })]);
            }
            var xPos = d3.mouse(this)[1];
            var points = yLeft.range();
            var space = points[1]-points[0];
            var j;
            for(j=0; xPos < (points[j] + space/2); j++) {

            }

            var y0 = yLeft.domain()[j],
                i = bisectDate(data[country], y0, 1),
	            d0 = data[country][j],
	            d1 = data[country][j],
	            d = y0 - d0.age > d1.age - y0 ? d1 : d0;
            d3.select("#focusOr").attr("transform", "translate(" + xLeft(d.male) + "," + (yLeft(d.age) + 1.5) + ")");
            d3.select("#focusHo").attr("transform", "translate(" + xLeft(d.male) + "," + (yLeft(d.age) + 1.5) + ")");

            d3.select("#focusFemOr").attr("transform", "translate(" + xRight(d.female) + "," + (yLeft(d.age) + 1.5) + ")");
            d3.select("#focusFemHo").attr("transform", "translate(" + xRight(d.female) + "," + (yLeft(d.age) + 1.5) + ")");

	      }
			
		}
}