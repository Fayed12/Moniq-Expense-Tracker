// local
import styles from "./CategoryDonutAndRankings.module.css";

// react
import { useState } from "react";

// recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

// react icons
import { FiChevronDown, FiPlus, FiMinus } from "react-icons/fi";
import { FaEllipsisH } from "react-icons/fa";
import {
    FaWallet,
    FaShoppingBag,
    FaUtensils,
    FaCar,
    FaHome,
    FaHeartbeat,
    FaFilm,
    FaBook,
    FaPlane,
    FaBolt,
    FaSpa,
    FaGift,
    FaBriefcase,
    FaLaptopCode,
    FaChartLine,
    FaPlusCircle,
    FaUniversity,
    FaMoneyBillWave,
    FaCreditCard,
    FaFlag,
    FaShieldAlt,
    FaLaptop,
} from "react-icons/fa";

const ICON_MAP = {
    FaWallet,
    FaShoppingBag,
    FaUtensils,
    FaCar,
    FaHome,
    FaHeartbeat,
    FaFilm,
    FaBook,
    FaPlane,
    FaBolt,
    FaSpa,
    FaGift,
    FaBriefcase,
    FaLaptopCode,
    FaChartLine,
    FaPlusCircle,
    FaUniversity,
    FaMoneyBillWave,
    FaCreditCard,
    FaFlag,
    FaShieldAlt,
    FaLaptop,
    FaEllipsisH,
};

function DynamicIcon({ name, size = 14, ...props }) {
    const IconComp = ICON_MAP[name];
    if (!IconComp) return <FaEllipsisH size={size} {...props} />;
    return <IconComp size={size} {...props} />;
}

// Active sector drawing (expands outward on hover)
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8} // expand by 8px on hover
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={4}
            />
        </g>
    );
};

export default function CategoryDonutAndRankings({ categoryBreakdown, rankedCategories, currency }) {
    const [breakdownType, setBreakdownType] = useState("expense"); // "expense" | "income"
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLegendExpanded, setIsLegendExpanded] = useState(false);

    const activeBreakdown = categoryBreakdown[breakdownType] || { items: [], total: 0 };
    const dataItems = activeBreakdown.items;
    const totalAmount = activeBreakdown.total;

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(-1);
    };

    const handleLegendClick = (index) => {
        if (activeIndex === index) {
            setActiveIndex(-1);
        } else {
            setActiveIndex(index);
        }
    };

    const displayedLegendItems = isLegendExpanded ? dataItems : dataItems.slice(0, 8);

    return (
        <section className={styles.containerSection} aria-label="Category spending breakdown">
            {/* Left Card: Donut Chart */}
            <article className={`${styles.leftCard} glass-card`} data-anim="middle-card">
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Spending by Category</h2>
                    
                    {/* Toggle dropdown */}
                    <div className={styles.dropdownSelector}>
                        <select
                            id="breakdown-type-select"
                            value={breakdownType}
                            onChange={(e) => {
                                setBreakdownType(e.target.value);
                                setActiveIndex(-1);
                            }}
                            className={styles.selectEl}
                            aria-label="Filter category breakdown by type"
                        >
                            <option value="expense">Expenses</option>
                            <option value="income">Income</option>
                        </select>
                        <FiChevronDown className={styles.selectChevron} />
                    </div>
                </div>

                <div className={styles.donutBody}>
                    {dataItems.length > 0 ? (
                        <div className={styles.donutVisualArea}>
                            {/* Donut Container */}
                            <div className={styles.donutContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            data={dataItems}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            dataKey="value"
                                            onMouseEnter={onPieEnter}
                                            onMouseLeave={onPieLeave}
                                            paddingAngle={2}
                                            cornerRadius={3}
                                        >
                                            {dataItems.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color || "var(--color-primary)"}
                                                    opacity={activeIndex === -1 || activeIndex === index ? 1 : 0.4}
                                                    style={{ outline: "none", cursor: "pointer" }}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                
                                {/* Centered labels */}
                                <div className={styles.centerText} aria-hidden="true">
                                    <span className={`${styles.centerVal} ${breakdownType === "expense" ? styles.redText : styles.greenText}`}>
                                        {currency} {totalAmount.toLocaleString()}
                                    </span>
                                    <span className={styles.centerLabel}>
                                        {breakdownType === "expense" ? "Total Expenses" : "Total Income"}
                                    </span>
                                </div>
                            </div>

                            {/* Legend Right */}
                            <div className={styles.legendArea}>
                                <ul className={styles.legendList} role="list">
                                    {displayedLegendItems.map((item, index) => {
                                        const isHighlighted = activeIndex === index;
                                        const isDimmed = activeIndex !== -1 && activeIndex !== index;
                                        return (
                                            <li
                                                key={item.name}
                                                className={`${styles.legendItem} ${isHighlighted ? styles.legendItemActive : ""} ${isDimmed ? styles.legendItemDimmed : ""}`}
                                                onClick={() => handleLegendClick(index)}
                                                role="listitem"
                                            >
                                                <span className={styles.squareDot} style={{ backgroundColor: item.color }} />
                                                <span className={styles.legendName}>{item.name}</span>
                                                <span className={styles.legendAmount}>{currency} {item.value.toLocaleString()}</span>
                                                <span className={styles.legendPill}>{item.percentage}%</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {dataItems.length > 8 && (
                                    <button
                                        type="button"
                                        className={styles.showMoreBtn}
                                        onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                                    >
                                        {isLegendExpanded ? (
                                            <>
                                                <FiMinus /> <span>Show Less</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiPlus /> <span>Show {dataItems.length - 8} More</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyDonutState}>
                            <p className={styles.emptyText}>No category records for this range</p>
                        </div>
                    )}
                </div>
            </article>

            {/* Right Card: Ranked spending categories */}
            <article className={`${styles.rightCard} glass-card`} data-anim="middle-card">
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Top Spending Categories</h2>
                    <span className={styles.badgePill}>This Period</span>
                </div>

                <div className={styles.rankingBody}>
                    {rankedCategories.length > 0 ? (
                        <div className={styles.rankingList} role="list">
                            {rankedCategories.map((item) => (
                                <div key={item.name} className={styles.rankingRow} role="listitem">
                                    <span className={styles.rankNum}>{item.rank}</span>
                                    <div
                                        className={styles.iconCircle}
                                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                    >
                                        <DynamicIcon name={item.icon} size={14} />
                                    </div>
                                    
                                    <div className={styles.rankingInfo}>
                                        <div className={styles.topInfo}>
                                            <span className={styles.catLabelText}>{item.name}</span>
                                            <span className={styles.txCountBadge}>{item.txCount} transactions</span>
                                        </div>
                                        
                                        <div className={styles.barContainer}>
                                            <div
                                                className={styles.barFill}
                                                style={{ width: `${item.progressPercent}%`, backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.rightAlignedAmount}>
                                        <span className={styles.rankAmount}>{currency} {item.value.toLocaleString()}</span>
                                        <span className={styles.rankPercent}>{item.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyRankingState}>
                            <p className={styles.emptyText}>No category rankings available</p>
                        </div>
                    )}
                </div>
            </article>
        </section>
    );
}
