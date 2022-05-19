import { FC, PropsWithChildren } from "react";

const PDFLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
    return <div className="p-2">
        {children}
    </div>;
}

export default PDFLayout;