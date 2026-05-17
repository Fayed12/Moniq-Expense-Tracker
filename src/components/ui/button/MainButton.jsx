
// local
import styles from "./MainButton.module.css";

// prop-types
import PropTypes from "prop-types";

// component
const MainButton = ({
    type = "button",
    title = "",
    children,
    action = "primary",
    size = "md",
    clickEvent,
    isDisabled = false,
    isLoading = false,
    href,
    className = "",
}) => {
    const sharedProps = {
        className: `${styles.btn} ${className}`.trim(),
        "aria-label": title,
        title,
        "data-variant": action,
        "data-size": size,
        "data-loading": isLoading ? "true" : undefined,
    };

    if (href) {
        return (
            <a href={href} {...sharedProps} target="_blank">
                {children}
            </a>
        );
    }

    return (
        <button
            {...sharedProps}
            type={type}
            onClick={clickEvent}
            disabled={isDisabled || isLoading}
        >
            {children}
        </button>
    );
};

MainButton.propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
    children: PropTypes.node,
    action: PropTypes.oneOf(["primary", "ghost", "outline", "danger", "glass"]),
    size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
    clickEvent: PropTypes.func,
    isDisabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    href: PropTypes.string,
    className: PropTypes.string,
};

export default MainButton;