import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { MindMapNode } from "../types";
import { useResizeObserver } from "../hooks/useResizeObserver";

interface MindMapRendererProps {
  data: MindMapNode;
  width: number;
  height: number;
  theme: "light" | "dark";
  onNodeSelect?: (node: MindMapNode) => void;
  onNodeDoubleClick?: (node: MindMapNode, position: { x: number, y: number, width: number, domElement: Element }) => void;
}

const MindMapRenderer: React.FC<MindMapRendererProps> = ({
  data,
  width,
  height,
  theme,
  onNodeSelect,
  onNodeDoubleClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(containerRef);
  // 使用useRef而不是useState以避免无限循环
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const actualWidth = dimensions?.width || width;
    const actualHeight = dimensions?.height || height;

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    // 创建SVG和可缩放容器
    const svg = d3
      .select(svgRef.current)
      .attr("width", actualWidth)
      .attr("height", actualHeight);

    // 创建可缩放的内容容器
    const g = svg
      .append("g")
      .attr("transform", transformRef.current.toString());

    // 添加缩放行为
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
        // 更新引用而不触发重新渲染
        transformRef.current = event.transform;
      });

    svg.call(zoomBehavior);

    // 使用初始变换，将思维导图居中
    svg.call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(actualWidth / 2, actualHeight / 2).scale(0.8)
    );

    // 计算每个节点层级的最大节点数，用于计算垂直间距
    const levelCounts: { [key: number]: number } = {};
    const countNodesByLevel = (node: MindMapNode, level: number) => {
      if (!levelCounts[level]) levelCounts[level] = 0;
      levelCounts[level]++;
      if (node.children) {
        node.children.forEach((child) => countNodesByLevel(child, level + 1));
      }
    };
    countNodesByLevel(data, 0);

    // 计算最大节点数量的层级，用于估算垂直间距
    const maxNodesInAnyLevel = Math.max(...Object.values(levelCounts));

    // 动态计算水平和垂直间距
    const horizontalSpacing = Math.min(
      300,
      Math.max(180, actualWidth / (Object.keys(levelCounts).length * 1.5))
    );
    const verticalSpacing = Math.min(
      120,
      Math.max(50, actualHeight / maxNodesInAnyLevel)
    );

    // 创建树形布局
    const tree = d3
      .tree<MindMapNode>()
      .size([
        actualHeight - verticalSpacing * 2,
        actualWidth / 2 - horizontalSpacing,
      ])
      .nodeSize([verticalSpacing, horizontalSpacing])
      .separation((a, b) => {
        // 为不同层级的节点提供不同的分离度
        return a.parent === b.parent ? 1.2 : 2;
      });

    // 准备数据层次结构
    const root = d3.hierarchy(data);
    const treeData = tree(root);

    // 自定义连接线生成器，创建曲线连接
    const linkGenerator = d3
      .linkHorizontal<
        d3.HierarchyPointLink<MindMapNode>,
        d3.HierarchyPointNode<MindMapNode>
      >()
      .x((d) => d.y)
      .y((d) => d.x);

    // 添加连接线
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", linkGenerator)
      .attr("fill", "none")
      .attr("stroke", theme === "dark" ? "#6b7280" : "#9ca3af")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", (d) => (d.source.depth === 0 ? "0" : "0")) // 可以为不同层级设置不同样式
      .attr("stroke-opacity", (d) => 0.8 - d.source.depth * 0.1);

    // 添加节点组
    const nodes = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr(
        "class",
        (d) => `node ${d.children ? "node-internal" : "node-leaf"}`
      )
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .attr("cursor", "pointer")
      .on("click", function (event, d) {
        // 阻止事件冒泡
        event.stopPropagation();

        // 点击节点时高亮显示
        d3.selectAll(".node").classed("node-selected", false);
        d3.select(this).classed("node-selected", true);

        // 调用节点选择回调
        if (onNodeSelect) {
          onNodeSelect(d.data);
        }
      })
      .on("dblclick", function (event, d) {
        // 阻止事件冒泡和默认行为
        event.stopPropagation();
        event.preventDefault();

        // 获取当前节点DOM元素
        const nodeElement = this;
        const rectElement = d3.select(this).select("rect").node() as SVGRectElement;
        
        // 计算节点宽度
        const textLength = d.data.text?.length || 0;
        const nodeWidth = Math.max(120, Math.min(250, textLength * 10));
        
        if (rectElement) {
          // 获取节点在屏幕上的精确位置
          const nodeRect = rectElement.getBoundingClientRect();
          
          // 调用双击回调并传入节点位置信息
          if (onNodeDoubleClick) {
            onNodeDoubleClick(d.data, {
              x: nodeRect.left + nodeRect.width / 2,
              y: nodeRect.top + nodeRect.height / 2 - 1, // 微调垂直位置
              width: nodeRect.width,
              domElement: nodeElement
            });
          }
        }
      });

    // 为不同级别的节点选择不同的颜色
    const getNodeColor = (depth: number) => {
      const colors =
        theme === "dark"
          ? ["#4b5563", "#374151", "#1f2937", "#111827", "#030712"]
          : ["#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280"];

      return colors[Math.min(depth, colors.length - 1)];
    };

    // 添加节点矩形
    nodes
      .append("rect")
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("x", (d) => {
        // 根据节点文本长度动态调整矩形宽度
        const textLength = d.data.text?.length || 0;
        const width = Math.max(120, Math.min(250, textLength * 10));
        return -width / 2;
      })
      .attr("y", -20)
      .attr("width", (d) => {
        // 根据节点文本长度动态调整矩形宽度
        const textLength = d.data.text?.length || 0;
        return Math.max(120, Math.min(250, textLength * 10));
      })
      .attr("height", 40)
      .attr("fill", (d) => getNodeColor(d.depth))
      .attr("stroke", theme === "dark" ? "#6b7280" : "#d1d5db")
      .attr("stroke-width", 1);

    // 添加节点文本
    nodes
      .append("text")
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("fill", theme === "dark" ? "#e5e7eb" : "#1f2937")
      .style("font-size", (d) => (d.depth === 0 ? "16px" : "14px"))
      .style("font-weight", (d) => (d.depth === 0 ? "bold" : "normal"))
      .style("pointer-events", "none")
      .text((d) => {
        const title = d.data.text || "";
        // 根据矩形宽度计算可显示的字符数
        const maxChars = Math.floor(
          Math.max(120, Math.min(250, title.length * 10)) / 8
        );
        return title.length > maxChars
          ? title.substring(0, maxChars - 3) + "..."
          : title;
      });

    // 添加子节点指示器（如果有子节点）
    nodes
      .filter(function (d: d3.HierarchyPointNode<MindMapNode>) {
        const hasChildren = Array.isArray(d.children) && d.children.length > 0;
        return hasChildren;
      })
      .append("circle")
      .attr("class", "toggle")
      .attr("r", 6)
      .attr("cx", (d) => {
        const textLength = d.data.text?.length || 0;
        const width = Math.max(120, Math.min(250, textLength * 10));
        return width / 2 + 15;
      })
      .attr("cy", 0)
      .attr("fill", theme === "dark" ? "#6b7280" : "#9ca3af")
      .attr("cursor", "pointer");

    // 添加子节点数量指示
    nodes
      .filter(function (d: d3.HierarchyPointNode<MindMapNode>) {
        const hasChildren = Array.isArray(d.children) && d.children.length > 0;
        return hasChildren;
      })
      .append("text")
      .attr("class", "toggle-text")
      .attr("x", (d) => {
        const textLength = d.data.text?.length || 0;
        const width = Math.max(120, Math.min(250, textLength * 10));
        return width / 2 + 15;
      })
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "12px")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text((d) => {
        // 显示子节点数量
        const childCount = d.children ? d.children.length : 0;
        return childCount > 0
          ? childCount > 9
            ? "9+"
            : childCount.toString()
          : "";
      });

    // 移除transform状态依赖，避免循环渲染
  }, [data, width, height, dimensions, theme, onNodeSelect, onNodeDoubleClick]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <svg ref={svgRef} className="mind-map-svg" />
    </div>
  );
};

export default MindMapRenderer;
