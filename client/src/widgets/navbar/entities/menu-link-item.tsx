import { memo, useCallback } from "react";
import { MenuLinkItemProps } from "../types/meni-link-item.type";
import Link from "next/link";
import { DOT_BASE } from "../shared/dot-base";

export const MenuLinkItem = memo(function MenuLinkItem({
    name,
    href,
    page,
    isActive,
    onClickLink,
    onHoverLink,
}: MenuLinkItemProps) {
    const handleClick = useCallback(
        (e: React.MouseEvent) => onClickLink(e, page, href),
        [onClickLink, page, href]
    );
    const handleHover = useCallback(() => onHoverLink(page), [onHoverLink, page]);

    return (
        <Link
            href={href}
            onClick={handleClick}
            onMouseEnter={handleHover}
            className="menu-link-item inline-flex items-center will-change-transform transition-colors duration-500 text-[3rem] xl:text-[3.5rem] tracking-[-0.01em] font-host-grotesk font-light group"
            style={{ transform: "translateY(120%)", opacity: 0.25 }}
        >
            <span
                className={`${DOT_BASE} ${
                    isActive
                        ? "opacity-100 scale-100 w-3 h-3 mr-4"
                        : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 group-hover:w-3 group-hover:h-3 group-hover:mr-4"
                }`}
            />
            <span className={isActive ? "font-normal" : ""}>{name}</span>
        </Link>
    );
});