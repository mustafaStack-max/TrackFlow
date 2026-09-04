
import { useEffect, useRef } from 'react';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';
import { EmptyState } from './Panel';

export default function MoneyFlowSankey({ nodes = [], links = [], height = 430 }) {
    const boxRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        let disposed = false;

        const run = async () => {
            const echarts = await import('echarts');
            if (disposed || !boxRef.current) return;

            chartRef.current?.dispose();
            chartRef.current = echarts.init(boxRef.current);

            chartRef.current.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: C.card,
                    borderColor: C.bHot,
                    padding: 10,
                    textStyle: { color: C.t1, fontFamily: 'IBM Plex Sans Arabic', fontSize: 12 },
                    formatter: (p) => {
                        if (p.dataType === 'edge') {
                            return `<b>${p.data.source}</b> ← <b>${p.data.target}</b><br/>` +
                                `<span style="font-family:'Share Tech Mono';color:${C.green}">${fmtMAD(p.data.value)} MAD</span>`;
                        }
                        return `<b>${p.name}</b><br/>` +
                            `<span style="font-family:'Share Tech Mono';color:${C.green}">${fmtMAD(p.value)} MAD</span>`;
                    },
                },
                series: [{
                    type: 'sankey',
                    left: 8, right: 8, top: 12, bottom: 12,
                    nodeWidth: 14,
                    nodeGap: 16,
                    nodeAlign: 'justify',
                    draggable: true,
                    emphasis: { focus: 'adjacency', lineStyle: { opacity: 0.6 } },
                    data: nodes.map((n) => ({ name: n.name, itemStyle: { color: n.color, borderWidth: 0 } })),
                    links: links.map((l) => ({ source: l.source, target: l.target, value: l.value })),
                    lineStyle: { color: 'gradient', curveness: 0.55, opacity: 0.3 },
                    label: {
                        color: C.t2,
                        fontFamily: 'IBM Plex Sans Arabic',
                        fontSize: 11.5,
                        fontWeight: 600,
                        formatter: (p) => `${p.name} · ${fmtMAD(p.value)}`,
                    },
                }],
            });
        };

        run();

        const onResize = () => chartRef.current?.resize();
        window.addEventListener('resize', onResize);

        return () => {
            disposed = true;
            window.removeEventListener('resize', onResize);
            chartRef.current?.dispose();
            chartRef.current = null;
        };
    }, [nodes, links]);

    if (!links.length) return <EmptyState>// لا توجد تدفقات في هذه الفترة //</EmptyState>;

    return <div ref={boxRef} style={{ width: '100%', height }} />;
}