import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ToolLogo from "../ToolLogo";

describe("ToolLogo", () => {
  it("renders a single normalized logo path from api data", () => {
    render(<ToolLogo slug="tenweb" name="10Web" logoPath="aitool/source/logos/10Web.png" />);

    const image = screen.getByRole("img", { name: "10Web logo" }) as HTMLImageElement;
    expect(image.getAttribute("src")).toBe("/logos/10Web.png");
  });

  it("falls back to brand mark when logoPath is missing", () => {
    render(<ToolLogo slug="unknown-tool" name="Unknown Tool" logoPath={null} />);

    fireEvent.error(screen.getByRole("img", { name: "Unknown Tool logo" }));
    expect(screen.getByLabelText("Unknown Tool mark")).toBeInTheDocument();
  });

  it("falls back to brand mark when the logo file cannot be resolved on the server", () => {
    render(<ToolLogo slug="broken-tool" name="Broken Tool" logoPath="/logos/not-exist.png" />);

    fireEvent.error(screen.getByRole("img", { name: "Broken Tool logo" }));
    expect(screen.getByLabelText("Broken Tool mark")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Broken Tool logo" })).not.toBeInTheDocument();
  });
});
