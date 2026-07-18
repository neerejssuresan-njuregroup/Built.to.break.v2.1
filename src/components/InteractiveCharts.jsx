/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ArrowUp } from "lucide-react";
import { EXPANSION_DATA, DEFICIT_DATA, CONGESTION_DATA, VULNERABILITY_DATA } from "../data";

const formatLabel = (label, width) => {
  if (width < 450) {
    return label
      .replace(" (Kalbadevi)", "")
      .replace(" (Hauz Rani)", "")
      .replace(" (Chickpet)", "")
      .replace(" (Burrabazar)", "")
      .replace(" (Old City)", "")
      .replace(" (George Town)", "")
      .replace("Lane A", "A")
      .replace("Lane B", "B")
      .replace("Extension", "Ext")
      .replace("C-Block", "C")
      .replace("Village", "Vil")
      .replace("Main Rd", "Rd")
      .replace("Marg", "Mg")
      .replace("Outer Ring Rd Jcn", "Ring Rd Jcn")
      .replace("LBS Marg", "LBS")
      .replace("Hauz Rani Lanes", "H. Rani Ln");
  } else {
    return label
      .replace(" (Kalbadevi)", "")
      .replace(" (Hauz Rani)", "")
      .replace(" (Chickpet)", "")
      .replace(" (Burrabazar)", "")
      .replace(" (Old City)", "")
      .replace(" (George Town)", "");
  }
};

export default function InteractiveCharts({ activeStep, stableWidth, stableHeight }) {
  const containerRef = useRef(null);
  const chartWrapperRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 200 });
  const [hoveredData, setHoveredData] = useState(null);

  // Monitor element resize to keep D3 graphics perfectly responsive
  useEffect(() => {
    if (stableWidth && stableHeight) {
      setDimensions({
        width: stableWidth,
        height: Math.max(220, stableHeight - 120),
      });
      return;
    }
    if (!chartWrapperRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(260, width),
        height: Math.max(160, height || 200),
      });
    });

    resizeObserver.observe(chartWrapperRef.current);
    return () => resizeObserver.disconnect();
  }, [stableWidth, stableHeight]);

  // D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return;

    const isMobile = dimensions.width < 450;
    const margin = {
      top: 15,
      right: isMobile ? 15 : 20,
      bottom: activeStep === "2" || activeStep === "3" ? (isMobile ? 65 : 55) : (isMobile ? 40 : 40),
      left: activeStep === "4" ? (isMobile ? 65 : 75) : (isMobile ? 40 : 45)
    };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings
    svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // TOOLTIP HELPERS
    let tooltipDiv = d3.select("#d3-interactive-tooltip");
    if (tooltipDiv.empty()) {
      tooltipDiv = d3.select("body")
        .append("div")
        .attr("id", "d3-interactive-tooltip")
        .style("position", "absolute")
        .style("background-color", "#0A0A0A")
        .style("border", "1px solid #222")
        .style("color", "#FFFFFF")
        .style("padding", "6px 8px")
        .style("pointer-events", "none")
        .style("font-family", "JetBrains Mono, monospace")
        .style("font-size", "11px")
        .style("z-index", "9999")
        .style("opacity", 0);
    }

    if (activeStep === "1") {
      // --- EXPANSION LINE CHART (GROWTH DYNAMICS) ---
      const years = EXPANSION_DATA.map((d) => d.year);
      
      const xScale = d3.scalePoint()
        .domain(years)
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, 110])
        .range([height, 0]);

      // X Axis
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "9px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#27272a"));

      // Y Axis
      chartGroup.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "9px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#18181b"));

      // Grid Lines
      chartGroup.append("g")
        .attr("class", "grid")
        .call(
          d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
            .tickFormat(() => "")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#18181b").attr("stroke-dasharray", "3,3"));

      // Line Generators
      const lineMixed = d3.line()
        .x((d) => xScale(d.year) || 0)
        .y((d) => yScale(d.mixedUse));

      const lineComm = d3.line()
        .x((d) => xScale(d.year) || 0)
        .y((d) => yScale(d.commercial));

      const lineRes = d3.line()
        .x((d) => xScale(d.year) || 0)
        .y((d) => yScale(d.residential));

      // Draw Lines
      chartGroup.append("path")
        .datum(EXPANSION_DATA)
        .attr("fill", "none")
        .attr("stroke", "#EF4444")
        .attr("stroke-width", 3)
        .attr("d", lineMixed);

      chartGroup.append("path")
        .datum(EXPANSION_DATA)
        .attr("fill", "none")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 2)
        .attr("d", lineComm);

      chartGroup.append("path")
        .datum(EXPANSION_DATA)
        .attr("fill", "none")
        .attr("stroke", "#71717a")
        .attr("stroke-width", 2)
        .attr("d", lineRes);

      // Draw Average Benchmark Guideline Indicator
      chartGroup.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(48))
        .attr("y2", yScale(48))
        .attr("stroke", "#EF4444")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.7);

      chartGroup.append("text")
        .attr("x", width - 5)
        .attr("y", yScale(48) - 5)
        .attr("text-anchor", "end")
        .attr("fill", "#EF4444")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .text("AVG: 48.0");

      // Interactive circles
      const series = [
        { key: "mixedUse", color: "#EF4444", label: "Mixed-Use" },
        { key: "commercial", color: "#FFFFFF", label: "Commercial" },
        { key: "residential", color: "#71717a", label: "Residential" }
      ];

      series.forEach((s) => {
        chartGroup.selectAll(`.circle-${s.key}`)
          .data(EXPANSION_DATA)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale(d.year) || 0)
          .attr("cy", (d) => yScale(d[s.key]))
          .attr("r", 4)
          .attr("fill", s.color)
          .attr("stroke", "#09090b")
          .attr("stroke-width", 1)
          .style("cursor", "pointer")
          .on("mouseover", (event, d) => {
            const val = d[s.key];
            tooltipDiv
              .style("opacity", 1)
              .html(`
                <div class="font-mono text-[10px] text-zinc-400 font-bold">${d.year} - ${s.label}</div>
                <div class="font-mono text-xs text-white font-black mt-0.5">${val} Units</div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mousemove", (event) => {
            tooltipDiv
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mouseout", () => {
            tooltipDiv.style("opacity", 0);
          });
      });

    } else if (activeStep === "2") {
      // --- DEFICIT STACKED BAR CHART (VERTICAL HEIGHTS) ---
      const locations = DEFICIT_DATA.map((d) => d.location);
      
      const xScale = d3.scaleBand()
        .domain(locations)
        .range([0, width])
        .padding(0.35);

      const yScale = d3.scaleLinear()
        .domain([0, 9])
        .range([height, 0]);

      // X Axis
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat((d) => formatLabel(d, dimensions.width)))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", isMobile ? "7px" : "8px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#27272a"))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", isMobile ? "rotate(-30)" : "rotate(-15)");

      // Y Axis
      chartGroup.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "9px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#18181b"));

      // Grid Lines
      chartGroup.append("g")
        .attr("class", "grid")
        .call(
          d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
            .tickFormat(() => "")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#18181b").attr("stroke-dasharray", "3,3"));

      // Draw Stacked Bars
      DEFICIT_DATA.forEach((d) => {
        const x = xScale(d.location) || 0;
        const barWidth = xScale.bandwidth();

        // Legal segment (bottom)
        const yLegal = yScale(d.legal);
        const hLegal = height - yLegal;

        chartGroup.append("rect")
          .attr("x", x)
          .attr("y", yLegal)
          .attr("width", barWidth)
          .attr("height", hLegal)
          .attr("fill", "#3f3f46")
          .attr("stroke", "#52525b")
          .attr("stroke-width", 1)
          .on("mouseover", (event) => {
            tooltipDiv
              .style("opacity", 1)
              .html(`
                <div class="font-mono text-[10px] text-zinc-400 font-bold">${d.location}</div>
                <div class="font-mono text-xs text-white font-black mt-0.5">Sanctioned: ${d.legal} Floors</div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mousemove", (event) => {
            tooltipDiv
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mouseout", () => {
            tooltipDiv.style("opacity", 0);
          });

        // Illegal segment (stacked top)
        const yIllegal = yScale(d.legal + d.illegal);
        const hIllegal = yScale(d.legal) - yIllegal;

        chartGroup.append("rect")
          .attr("x", x)
          .attr("y", yIllegal)
          .attr("width", barWidth)
          .attr("height", hIllegal)
          .attr("fill", "#EF4444")
          .attr("stroke", "#dc2626")
          .attr("stroke-width", 1)
          .on("mouseover", (event) => {
            tooltipDiv
              .style("opacity", 1)
              .html(`
                <div class="font-mono text-[10px] text-zinc-400 font-bold">${d.location}</div>
                <div class="font-mono text-xs text-[#EF4444] font-black mt-0.5">Unauthorized: +${d.illegal} Floors</div>
                <div class="font-mono text-[9px] text-zinc-500 mt-0.5">Total: ${d.legal + d.illegal} Floors</div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mousemove", (event) => {
            tooltipDiv
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mouseout", () => {
            tooltipDiv.style("opacity", 0);
          });
      });

      // Draw Average Benchmark Guideline Indicator
      chartGroup.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(3.5))
        .attr("y2", yScale(3.5))
        .attr("stroke", "#EF4444")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.7);

      chartGroup.append("text")
        .attr("x", width - 5)
        .attr("y", yScale(3.5) - 5)
        .attr("text-anchor", "end")
        .attr("fill", "#EF4444")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .text("URBAN AVG: 3.5 FLOORS");

    } else if (activeStep === "3") {
      // --- CONGESTION GROUPED BAR CHART (TRANSIT DELAYS) ---
      const corridors = CONGESTION_DATA.map((d) => d.corridor);

      const xScale0 = d3.scaleBand()
        .domain(corridors)
        .range([0, width])
        .padding(0.3);

      const xScale1 = d3.scaleBand()
        .domain(["baseline", "peak"])
        .range([0, xScale0.bandwidth()])
        .padding(0.05);

      const yScale = d3.scaleLinear()
        .domain([0, 48])
        .range([height, 0]);

      // X Axis
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale0).tickFormat((d) => formatLabel(d, dimensions.width)))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", isMobile ? "7px" : "8px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#27272a"))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", isMobile ? "rotate(-30)" : "rotate(-15)");

      // Y Axis
      chartGroup.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "9px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#18181b"));

      // Grid Lines
      chartGroup.append("g")
        .attr("class", "grid")
        .call(
          d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
            .tickFormat(() => "")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#18181b").attr("stroke-dasharray", "3,3"));

      // Render Grouped Bars
      CONGESTION_DATA.forEach((d) => {
        const x0 = xScale0(d.corridor) || 0;

        // Baseline Bar
        chartGroup.append("rect")
          .attr("x", x0 + (xScale1("baseline") || 0))
          .attr("y", yScale(d.baseline))
          .attr("width", xScale1.bandwidth())
          .attr("height", height - yScale(d.baseline))
          .attr("fill", "#3f3f46")
          .attr("stroke", "#52525b")
          .attr("stroke-width", 1)
          .on("mouseover", (event) => {
            tooltipDiv
              .style("opacity", 1)
              .html(`
                <div class="font-mono text-[10px] text-zinc-400 font-bold">${d.corridor}</div>
                <div class="font-mono text-xs text-white mt-0.5">Baseline: ${d.baseline} Mins</div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mousemove", (event) => {
            tooltipDiv
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mouseout", () => {
            tooltipDiv.style("opacity", 0);
          });

        // Peak Bar
        chartGroup.append("rect")
          .attr("x", x0 + (xScale1("peak") || 0))
          .attr("y", yScale(d.peak))
          .attr("width", xScale1.bandwidth())
          .attr("height", height - yScale(d.peak))
          .attr("fill", "#F97316")
          .attr("stroke", "#ea580c")
          .attr("stroke-width", 1)
          .on("mouseover", (event) => {
            tooltipDiv
              .style("opacity", 1)
              .html(`
                <div class="font-mono text-[10px] text-zinc-400 font-bold">${d.corridor}</div>
                <div class="font-mono text-xs text-[#F97316] font-black mt-0.5">Peak Travel: ${d.peak} Mins</div>
                <div class="font-mono text-[9px] text-zinc-500 mt-0.5">Delay Penalty: +${d.peak - d.baseline} Mins</div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mousemove", (event) => {
            tooltipDiv
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mouseout", () => {
            tooltipDiv.style("opacity", 0);
          });
      });

      // Draw Average Benchmark Guideline Indicator
      chartGroup.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(16.5))
        .attr("y2", yScale(16.5))
        .attr("stroke", "#EF4444")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.7);

      chartGroup.append("text")
        .attr("x", width - 5)
        .attr("y", yScale(16.5) - 5)
        .attr("text-anchor", "end")
        .attr("fill", "#EF4444")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .text("AVG: 16.5 MIN");

    } else if (activeStep === "4") {
      // --- VULNERABILITY HORIZONTAL STACKED BAR CHART ---
      const cities = VULNERABILITY_DATA.map((d) => d.city);

      const yScale = d3.scaleBand()
        .domain(cities)
        .range([0, height])
        .padding(0.3);

      const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

      // X Axis
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "9px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#27272a"));

      // Y Axis
      chartGroup.append("g")
        .call(d3.axisLeft(yScale).tickFormat((d) => formatLabel(d, dimensions.width)))
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", isMobile ? "7px" : "8px")
        .attr("color", "#71717a")
        .call(g => g.select(".domain").attr("stroke", "#27272a"))
        .call(g => g.selectAll(".tick line").attr("stroke", "#27272a"));

      // Grid Lines
      chartGroup.append("g")
        .attr("class", "grid")
        .call(
          d3.axisBottom(xScale)
            .ticks(5)
            .tickSize(height)
            .tickFormat(() => "")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#18181b").attr("stroke-dasharray", "3,3"));

      // Render Horizontal Bars
      VULNERABILITY_DATA.forEach((d) => {
        const y = yScale(d.city) || 0;
        const barHeight = yScale.bandwidth();

        // Delay Component bar (starting at 0)
        const wDelay = xScale(d.delayComponent);

        chartGroup.append("rect")
          .attr("x", 0)
          .attr("y", y)
          .attr("width", wDelay)
          .attr("height", barHeight)
          .attr("fill", "#EF4444")
          .attr("stroke", "#dc2626")
          .attr("stroke-width", 1)
          .on("mouseover", (event) => {
            tooltipDiv
              .style("opacity", 1)
              .html(`
                <div class="font-mono text-[10px] text-zinc-400 font-bold">${d.city}</div>
                <div class="font-mono text-xs text-[#EF4444] font-black mt-0.5">Emergency Access Delay: ${d.delayComponent}</div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mousemove", (event) => {
            tooltipDiv
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mouseout", () => {
            tooltipDiv.style("opacity", 0);
          });

        // Density Component bar (stacked on top/next to delay component)
        const xDensity = wDelay;
        const wDensity = xScale(d.densityComponent);

        chartGroup.append("rect")
          .attr("x", xDensity)
          .attr("y", y)
          .attr("width", wDensity)
          .attr("height", barHeight)
          .attr("fill", "#FFFFFF")
          .attr("stroke", "#e4e4e7")
          .attr("stroke-width", 1)
          .on("mouseover", (event) => {
            tooltipDiv
              .style("opacity", 1)
              .html(`
                <div class="font-mono text-[10px] text-zinc-400 font-bold">${d.city}</div>
                <div class="font-mono text-xs text-white font-black mt-0.5">Building Code Violations: ${d.densityComponent}</div>
                <div class="font-mono text-[9px] text-zinc-500 mt-0.5">Aggregate Index Score: ${d.index}</div>
              `)
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mousemove", (event) => {
            tooltipDiv
              .style("left", `${event.pageX + 12}px`)
              .style("top", `${event.pageY - 12}px`);
          })
          .on("mouseout", () => {
            tooltipDiv.style("opacity", 0);
          });
      });

      // Draw Average Benchmark Guideline Indicator (Vertical since this is a horizontal bar chart)
      chartGroup.append("line")
        .attr("x1", xScale(58))
        .attr("x2", xScale(58))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#EF4444")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.7);

      chartGroup.append("text")
        .attr("x", xScale(58) + 5)
        .attr("y", 12)
        .attr("text-anchor", "start")
        .attr("fill", "#EF4444")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .text("AVG: 58");
    }

  }, [activeStep, dimensions]);

  const renderHeader = () => {
    switch (activeStep) {
      case "1":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 mb-4 border-b border-zinc-900 pb-3">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold block">Metric: Footprint Index (Base 100)</span>
              <span className="text-[10px] font-mono text-zinc-600 block mt-0.5">10-YEAR METROPOLITAN LAND SATURATION</span>
            </div>
            <div className="flex items-center gap-3 bg-red-950/20 border border-red-950/30 px-3 py-1.5 rounded-none self-start sm:self-auto">
              <div className="flex items-center justify-center w-6 h-6 rounded-none bg-red-950/40 border border-red-500/30">
                <ArrowUp className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">MIXED-USE VS URBAN AVG</span>
                  <span className="text-xs font-mono font-black text-red-500">+104%</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block">Avg: 48.0 | Current Selection: 98.0</span>
              </div>
            </div>
          </div>
        );
      case "2":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 mb-4 border-b border-zinc-900 pb-3">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold block">Metric: Number of Building Floors</span>
              <span className="text-[10px] font-mono text-zinc-600 block mt-0.5">UNAUTHORIZED VERTICAL HEIGHT INDEX</span>
            </div>
            <div className="flex items-center gap-3 bg-red-950/20 border border-red-950/30 px-3 py-1.5 rounded-none self-start sm:self-auto">
              <div className="flex items-center justify-center w-6 h-6 rounded-none bg-red-950/40 border border-red-500/30">
                <ArrowUp className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">FLOORS VS URBAN AVG</span>
                  <span className="text-xs font-mono font-black text-red-500">+77%</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block">Avg: 3.5 Floors | Selected Area Avg: 6.2</span>
              </div>
            </div>
          </div>
        );
      case "3":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 mb-4 border-b border-zinc-900 pb-3">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold block">Metric: Travel Time for 5km (Minutes)</span>
              <span className="text-[10px] font-mono text-zinc-600 block mt-0.5">PEAK RESPONSE ROUTING DELAYS</span>
            </div>
            <div className="flex items-center gap-3 bg-orange-950/20 border border-orange-950/30 px-3 py-1.5 rounded-none self-start sm:self-auto">
              <div className="flex items-center justify-center w-6 h-6 rounded-none bg-orange-950/40 border border-orange-500/30">
                <ArrowUp className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">COMMUTE DELAY VS URBAN AVG</span>
                  <span className="text-xs font-mono font-black text-orange-500">+95%</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block">Avg: 16.5 Min | Selected Peak Avg: 32.2</span>
              </div>
            </div>
          </div>
        );
      case "4":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 mb-4 border-b border-zinc-900 pb-3">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold block">Metric: Vulnerability Score (Max 100)</span>
              <span className="text-[10px] font-mono text-zinc-600 block mt-0.5">METROPOLITAN COLLAPSE INDEX</span>
            </div>
            <div className="flex items-center gap-3 bg-red-950/20 border border-red-950/30 px-3 py-1.5 rounded-none self-start sm:self-auto">
              <div className="flex items-center justify-center w-6 h-6 rounded-none bg-red-950/40 border border-red-500/30">
                <ArrowUp className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">HAZARD INDEX VS URBAN AVG</span>
                  <span className="text-xs font-mono font-black text-red-500">+58%</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block">Avg Score: 58.0 | Selected Cities Avg: 92.0</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderLegend = () => {
    switch (activeStep) {
      case "1":
        return (
          <div className="flex flex-wrap gap-4 px-2 mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span>Mixed-Use Spaces</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" />
              <span>Commercial Units</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#71717a]" />
              <span>Residential Areas</span>
            </div>
          </div>
        );
      case "2":
        return (
          <div className="flex flex-wrap gap-4 px-2 mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#3f3f46] border border-[#52525b]" />
              <span>Sanctioned Legal Floors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#EF4444]" />
              <span>Unauthorized Illegal Floors</span>
            </div>
          </div>
        );
      case "3":
        return (
          <div className="flex flex-wrap gap-4 px-2 mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#3f3f46] border border-[#52525b]" />
              <span>Baseline Commute (Empty)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#F97316]" />
              <span>Peak Congestion Delay</span>
            </div>
          </div>
        );
      case "4":
        return (
          <div className="flex flex-wrap gap-4 px-2 mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#EF4444]" />
              <span>Emergency Access Delay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#FFFFFF]" />
              <span>Bldg Code Violations</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-none" id="chart-container-panel" ref={containerRef}>
      {renderHeader()}
      <div className="w-full flex-grow relative min-h-[220px]" ref={chartWrapperRef}>
        <svg ref={svgRef} className="absolute inset-0 w-full h-full overflow-visible" />
      </div>
      {renderLegend()}
    </div>
  );
}
