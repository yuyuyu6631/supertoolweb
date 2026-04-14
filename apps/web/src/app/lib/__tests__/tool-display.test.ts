import { detectPriceLabel } from "../tool-display";

describe("detectPriceLabel", () => {
  it("prefers pricingType over misleading text", () => {
    expect(
      detectPriceLabel({
        pricingType: "subscription",
        price: "Lifetime deal",
        name: "ChatGPT",
        summary: "Best subscription assistant",
        tags: ["assistant"],
      }),
    ).toBe("subscription");
  });

  it("maps one_time pricingType to one-time label", () => {
    expect(
      detectPriceLabel({
        pricingType: "one_time",
        price: "",
        name: "Gamma",
        summary: "Presentation builder",
        tags: ["slides"],
      }),
    ).toBe("one-time");
  });

  it("does not misclassify freemium text as free", () => {
    expect(
      detectPriceLabel({
        price: "",
        name: "Cursor",
        summary: "Freemium coding assistant",
        tags: ["ide"],
      }),
    ).toBe("freemium");
  });
});
