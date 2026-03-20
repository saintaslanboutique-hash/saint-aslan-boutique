export interface MenuLinkItemProps {
    name: string;
    href: string;
    page: string;
    isActive: boolean;
    onClickLink: (e: React.MouseEvent, page: string, href: string) => void;
    onHoverLink: (page: string) => void;
}