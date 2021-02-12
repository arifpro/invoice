import React, { FC } from "react";
import { View as PdfView } from "@react-pdf/renderer";
import compose from "../styles/compose";

interface Props {
  className?: string;
  pdfMode?: boolean;
}

const View: FC<Props> = (props) => {
  const { className, pdfMode, children } = props;
  return (
    <>
      {pdfMode ? (
        <PdfView
          style={compose("view " + (className ? className : ""))}
        >
          {children}
        </PdfView>
      ) : (
        <div className={"view " + (className ? className : "")}>{children}</div>
      )}
    </>
  );
};

export default View;
