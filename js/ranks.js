function initRankings(){
$(document).ready(function() {
  var years;
  var vpwidth, dat;
  var formatNumber = d3.format(",.0f");
  var sideEnds = {
    "2015":0,
    "2012":80,
    "2009":160,
    "2006":240,
    "2003":320,
    "2000":400
  };
  
  var placeholder = d3.select(".l-box.origins:not(.full)");
      placeholder.append("div").attr("id", "vis");
      vpwidth = $("#vis").width();
    var width = $(".l-box.chart.origins").width();
    var margin;
    width > 800 ? margin = {top: 25, right: 70, bottom: 20, left: 100} : margin = {top: 25, right: 52, bottom: 20, left: 78};

    var pillTypes = [
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"mea", name:"Middle East"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"eeu", name:"Europe"},
      {func:oneColor, opts: {colors:["#F06F2D"]}, id:"fea", name:"Asia"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"afr", name:"Africa"},
      {func:oneColor, opts: {colors:["#ededed"]}, id:"oth", name:"Other"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"SYR", name:"Syria"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"AFG", name:"Afghanistan"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"KSV", name:"Kosovo"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"ERI", name:"Eritrea"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"SRB", name:"Serbia"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"PAK", name:"Pakistan"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"IRQ", name:"Iraq"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"NGA", name:"Nigeria"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"RUS", name:"Russia"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"ALB", name:"Albania"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"SOM", name:"Somalia"},
      {func:oneColor, opts: {colors:["#ededed"]}, id:"STL", name:"Stateless"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"UKR", name:"Ukraine"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"MLI", name:"Mali"},
      {func:oneColor, opts: {colors:["#F06F2D"]}, id:"BGD", name:"Bangladesh"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"GMB", name:"Gambia"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"IRN", name:"Iran"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"BIH", name:"BiH"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"MKD", name:"FYR of Macedonia"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"GEO", name:"Georgia"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"FSM", name:"Serbia & Mont."},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"TUR", name:"Turkey"},
      {func:oneColor, opts: {colors:["#F06F2D"]}, id:"LKA", name:"Sri Lanka"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"ROU", name:"Romania"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"DZA", name:"Algeria"},
      {func:oneColor, opts: {colors:["#ededed"]}, id:"UNK", name:"Unknown"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"ARM", name:"Armenia"},
      {func:oneColor, opts: {colors:["#F06F2D"]}, id:"IND", name:"India"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"SLE", name:"Sierra Leone"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"VNM", name:"Vietnam"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"SDN", name:"Sudan"},
      {func:oneColor, opts: {colors:["#951c55"]}, id:"COL", name:"Colombia"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"AZE", name:"Azerbaijan"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"AGO", name:"Angola"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"MDA", name:"Moldova"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"CZE", name:"Czech Rep."},
      {func:oneColor, opts: {colors:["#951c55"]}, id:"HTI", name:"Haiti"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"COD", name:"Congo DR"},
      {func:oneColor, opts: {colors:["#ff9b0b"]}, id:"CHN", name:"China"},
      {func:oneColor, opts: {colors:["#4bc6df"]}, id:"MNE", name:"Montenegro"},
      {func:oneColor, opts: {colors:["#363636"]}, id:"ZWE", name:"Zimbabwe"}

    ];

    var pillMap = d3.map(pillTypes, function(d) { 
      return d.id; 
    });

    var pillSpace = 10;
    var data = [];
    var aspect = 0;
    var svg = null;
    var g = null;
    var defs = null;
    var pillsAndSpaces = width - margin.left - margin.right;
    width > 600 ? years = ["2000", "2003", "2006", "2009", "2012", "2015"] : years = ["2000", "2006", "2012", "2015"];
    var yearSpace = pillsAndSpaces/years.length/3;
    var pillWidth = (pillsAndSpaces - (yearSpace * years.length)) / years.length;
    var pillHeight = 20;
    var height = (pillHeight + pillSpace) * 15;

    function pillPath(width, height, padding) {

      var edge = width / 10;
      var halfHeight = height / 2;

      var path = "M 0," + halfHeight;
      path += " l " + edge + "," + (-1 * halfHeight);
      path += " l " + (width - (edge * 2)) + ",0";
      path += " l " + edge + "," + halfHeight;
      path += " l " + (-1 * edge) + "," + halfHeight;
      path += " l " + (-1 * (width - (edge * 2))) + ",0";
      path += " Z";

      return path;
    }

    function oneColor(selection, width, height, opts) {
      selection.selectAll("rect")
        .data([opts.colors[0]]).enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", function(d) { return d; });
    }

    function prepareData(rawData) {
      rawData.forEach(function(d) {
        years.forEach(function(y) {
          d[y] = +d[y];
        });
      });

      return rawData;
    }

    function createLinks(data) {
      var links = [];
      data.forEach(function(d) {
        for(var i = 1; i < years.length; i++) {
          links.push({id:d.id, start:d[years[i-1]], end:d[years[i]], gap:i});
        }
      });

      return links.filter(function(l) { return l.start > 0 && l.end > 0; });
    }

    function getCauseTitles(data) {
      endYears = [];
      data.forEach(function(d) {
        var started = false;
        for(var i = 0; i < years.length; i++) {
          if((started) && (isNaN(d[years[i]]) || d[years[i]] == -1)) {
            if(i > 1) {
              var yr = {
                id:d.id,
                year:years[i - 1],
                pos:d[years[i - 1]],
                name:pillMap.get(d.id).name,
                index:i - 1
              };
              endYears.push(yr);
            }
            /*if((d.id === "nbed") && (i === 7) || (d.id === "wil") && (i === 4)) { //TODO fix bad hack
              continue;
            } else {
              break;
            }*/
          } else if(i + 1 === years.length) {
            endYears.push({id:d.id, year:years[i], pos:d[years[i]], name:pillMap.get(d.id).name, index:i});
          } else if(!(isNaN(d[years[i]])) && (d[years[i]] !== -1)) {
            if(i > 0 && !started) {
              endYears.push({id:d.id, year:years[i], pos:d[years[i]], name:pillMap.get(d.id).name, index:i});
            } else if(d[years[i]] > sideEnds[years[i]]) {
              endYears.push({id:d.id, year:years[i], pos:d[years[i]], name:pillMap.get(d.id).name, index:i});
            }
            if((d.id === "pet") && (i === 3)) { //TODO fix bad hack
              started = false;
            } else {
              started = true;
            }
          }
        }
      });

      return endYears;
    }

    function getStartCauses(data) {
      var startIds = data
      .filter(function(d) { return d[years[0]] > 0; })
      .sort(function (a,b) {return d3.ascending(a[years[0]], b[years[0]]); })
      .map(function(d) { return d.id; });
      var causes = startIds.map(function(d) { return {id:d, name:pillMap.get(d).name}; });
      return causes;
    }

    d3.csv("data/asylum_origins.csv", function(error, data){
      drawBump(data);
    })

    function drawBump(rawData){
      var mobile;
      $(".l-box.chart.origins").width() < 800 ? mobile = true : mobile = false;
      mobile ? d3.select(".l-box.intro.origins").select(".note").html("Numbers on mouse over are asylum seekers, thousands") : "";
      width = vpwidth;
      data = prepareData(rawData);
      var links = createLinks(data);
      var causeTitles = getCauseTitles(data);
      var startCauses = getStartCauses(data);

      svg = d3.select("#vis").selectAll("svg").data([data]);
      var gEnter = svg.enter().append("svg").append("g");

      svg.attr("width", width);
      svg.attr("height", height + margin.top + margin.bottom + 5 );
      //svg.attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom));
      svg.attr("preserveAspectRatio", "xMidYMid");

      aspect = (width + margin.left + margin.right) / (height + margin.left + margin.right);

      defs = svg.append("defs");

      var pill = defs.append("clipPath")
        .attr("id", "pill")
        .append("path")
        .attr("d", pillPath(pillWidth, pillHeight));

      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.selectAll(".cause-title")
        .data(startCauses).enter()
        .append("text")
        .attr("class", "title cause-title start-cause")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("dx", -5)
        .attr("dy", pillHeight - 6)
        .attr("y", function(d,i) { return (pillHeight + pillSpace) * i; })
        .text(function(d) { return d.name; })
        .style("font-size", function(d){ return width < 600 && (d.name == "Afghanistan" || d.name == "Bangladesh" || d.name == "Serbia & Mont." || d.name == "Sierra Leone") ? "10px" : "12px";});

      var defpills = defs.selectAll("pill")
        .data(pillTypes)
        .enter()
        .append("g")
        .attr("id", function(d) { return d.id; })
        .attr("class", "pill");

      defpills.append("g").attr("clip-path", "url(#pill)")
        .each(function(d,i) {
          d3.select(this).call(d.func, pillWidth, pillHeight, d.opts);
        });

      g.selectAll("links").data(links)
        .enter()
        .append("line")
        .attr("class", "bump_link")
        .attr("x1", function(d,i) { return ((pillWidth + yearSpace) * d.gap) - (yearSpace ); })
        .attr("y1", function(d,i) { return (pillHeight + pillSpace) * (d.start - 1) + (pillHeight / 2); })
        .attr("x2", function(d,i) { return ((pillWidth + yearSpace) * d.gap); })
        .attr("y2", function(d,i) { return (pillHeight + pillSpace) * (d.end - 1) + (pillHeight / 2); });

      var year = g.selectAll("year").data(years)
        .enter()
        .append("g")
        .attr("class", "year")
        .attr("transform", function(d,i) { return "translate(" + ((pillWidth + yearSpace) * i) + ",0)";  });

      year.append("text")
        .attr("class", "title year-title")
        .attr("text-anchor", "middle")
        .attr("x", pillWidth / 2)
        .attr("dy", -8)
        .text(function(d) { return d; });

      var use = year.selectAll("pill-use")
        .data(function(y) {
          return data.map(function(d) {
            return {"id":d.id, "value":d[y], "tot":d["val"+y]};
          }).filter(function(d) { return d.value > 0; });
        })
        .enter()
        .append("use")
        .attr("xlink:href", function(d) { return "#" + d.id;})
        .attr("class", "pill-use")
        .attr("transform", function(d,i) {
          return "translate(0," + (d.value - 1) * (pillHeight + pillSpace) + ")";
        })
        .on("mouseover", mouseover)
        .on("click", mouseover)
        .on("mouseout", mouseout);

      year.selectAll("valueLab")
        .data(function(y) {
          return data.map(function(d) {
            return {"id":d.id, "value":d[y], "tot":d["val"+y]};
          }).filter(function(d) { return d.value > 0; });
        })
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", function(d){ return d.id === "ERI" || d.id === "NGA" || d.id === "SOM" || d.id === "SLE" || d.id === "GMB" || d.id === "DZA" || d.id === "COD" || d.id === "ZWE" ? "#fff" : "#333"; })
        .text(function(d){ return width > 600 ? formatNumber(d.tot) : formatNumber(Math.round(d.tot*100)/100000);})
        .attr("class", "valueLab")
        .attr("transform", function(d,i) {
          var c = (d.value - 1) * (pillHeight + pillSpace) + 15;
          return "translate(" + pillWidth / 2 + "," + c  + ")";
        });

      g.selectAll("end-title")
        .data(causeTitles)
        .enter()
        .append("text")
        .attr("class", "title end-title")
        .attr("transform", function(d,i) {
          var x = ((pillWidth + yearSpace) * d.index);
          var y = (d.pos ) * (pillHeight + pillSpace);
          return "translate(" + x + "," + y + ")";
        })
        .attr("text-anchor", function(d) { return d.pos > sideEnds[d.year] ? "left" : "middle"; })
        .attr("dx", function(d) { return d.pos > sideEnds[d.year] ? pillWidth + 5 : pillWidth / 2;})
        .attr("dy", -1 * (pillHeight - 4))
        .text(function(d) { return d.name; })
        .style("font-size", function(d){ return (d.name == "Afghanistan" || d.name == "Bangladesh") && width < 600 ? "10px" : "12px";});

      //KEY
      var key = d3.select(".l-box.intro.origins")
        .append("svg")
        .attr("height", function(){ return mobile ? 50 : 150 })
        .attr("width", $(".l-box.origins.intro").width());

      var mea = key.append("g")
        .attr("class", "bump_legend");

      mea.append("use")
        .attr("class", "pill-use")
        .attr("xlink:href", "#mea")
        .attr("y", 0);
      mea.append("text").text("Middle east")
        .attr("x", $("#SYR")[0].getBoundingClientRect().width + 3)
        .attr("y", 15);

      var eeu = key.append("g")
        .attr("class", "bump_legend");

      eeu.append("use")
        .attr("class", "pill-use")
        .attr("xlink:href", "#eeu")
        .attr("y", 30);
      eeu.append("text").text("Europe")
        .attr("x", $("#SYR")[0].getBoundingClientRect().width + 3)
        .attr("y", 45);

      var fea = key.append("g")
        .attr("class", "bump_legend");

      fea.append("use")
        .attr("class", "pill-use")
        .attr("xlink:href", "#fea")
        .attr("y", function(){ return mobile ? 0 : 60 })
        .attr("x", function(){ return mobile ? 130 : 0 });
      fea.append("text").text("Asia")
        .attr("x", function(){ return mobile ? $("#SYR")[0].getBoundingClientRect().width + 133 : $("#SYR")[0].getBoundingClientRect().width + 3 })
        .attr("y", function(){ return mobile ? 15 : 75 });

      var afr = key.append("g")
        .attr("class", "bump_legend");

      afr.append("use")
        .attr("class", "pill-use")
        .attr("xlink:href", "#afr")
        .attr("y", function(){ return mobile ? 30 : 90 })
        .attr("x", function(){ return mobile ? 130 : 0 });
      afr.append("text").text("Africa")
        .attr("x", function(){ return mobile ? $("#SYR")[0].getBoundingClientRect().width + 133 : $("#SYR")[0].getBoundingClientRect().width + 3 })
        .attr("y", function(){ return mobile ? 45 : 105 });

      var oth = key.append("g")
        .attr("class", "bump_legend");

      oth.append("use")
        .attr("class", "pill-use")
        .attr("xlink:href", "#oth")
        .attr("y", function(){ return mobile ? 0 : 120 })
        .attr("x", function(){ return mobile ? 230 : 0 });
      oth.append("text").text("Other")
        .attr("x", function(){ return mobile ? $("#SYR")[0].getBoundingClientRect().width + 233 : $("#SYR")[0].getBoundingClientRect().width + 3 })
        .attr("y", function(){ return mobile ? 15 : 135 });
    }



    function mouseover(d,i) {
      console.log("over");
      var leftLab = d3.selectAll(".start-cause").filter(function(e) { return e.id === d.id; });
      var leftLabY = d3.select(leftLab[0][0]).attr("y");
      var rightLab = d3.selectAll(".end-title").filter(function(e) { return e.id === d.id; });
      var tRightLab = d3.transform(d3.select(rightLab[0][0]).attr("transform"));
      var t = d3.transform(d3.select(this).attr("transform"));

      if (leftLabY > 450 && tRightLab.translate[1] > 450){
        d3.select(this.parentNode).append("text")
          .attr("class", "contry")
          .attr("y", t.translate[1] - 10)
          .attr("text-anchor", "middle")
          .attr("x", pillWidth/2)
          .text(rightLab[0][0].innerHTML);
      }

      g.selectAll(".bump_link")
        .classed("highlight", function(e) {return e.id === d.id; })
        .classed("unhighlight", function(e) {return e.id !== d.id; });
      g.selectAll(".start-cause")
        .classed("highlight", function(e) { return e.id === d.id; })
        .classed("unhighlight", function(e) {return e.id !== d.id; });
      g.selectAll(".valueLab")
        .classed("highl", function(e) {return e.id === d.id; })
        .classed("unhighl", function(e) {return e.id !== d.id; });
    }

    function mouseout(d,i) {
      d3.selectAll(".contry").remove();

      g.selectAll(".bump_link").classed("highlight", false);
      g.selectAll(".bump_link").classed("unhighlight", false);
      g.selectAll(".start-cause").classed("highlight", false);
      g.selectAll(".start-cause").classed("unhighlight", false);
      g.selectAll(".valueLab").classed("highl", false);
      g.selectAll(".valueLab").classed("unhighl", false);
    }

  });

}
