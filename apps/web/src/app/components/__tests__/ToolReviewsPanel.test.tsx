import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ToolReviewsPanel from "../ToolReviewsPanel";

const mockFetchMyToolReview = vi.fn();
const mockFetchToolReviews = vi.fn();
const mockSaveMyToolReview = vi.fn();

vi.mock("../auth/AuthProvider", () => ({
  useAuth: () => ({
    currentUser: null,
    status: "guest",
  }),
}));

vi.mock("../../lib/catalog-api", () => ({
  fetchMyToolReview: (...args: unknown[]) => mockFetchMyToolReview(...args),
  fetchToolReviews: (...args: unknown[]) => mockFetchToolReviews(...args),
  saveMyToolReview: (...args: unknown[]) => mockSaveMyToolReview(...args),
}));

describe("ToolReviewsPanel", () => {
  beforeEach(() => {
    mockFetchMyToolReview.mockReset();
    mockFetchToolReviews.mockReset();
    mockSaveMyToolReview.mockReset();
  });

  it("loads published reviews on mount when the page does not provide them", async () => {
    mockFetchToolReviews.mockResolvedValue({
      summary: {
        average: 4.5,
        reviewCount: 1,
        ratingDistribution: { "5": 1, "4": 0, "3": 0, "2": 0, "1": 0 },
      },
      editorReviews: [],
      userReviews: [
        {
          id: 1,
          toolId: 1,
          sourceType: "user",
          title: "Great tool",
          body: "Saved correctly",
          rating: 5,
          createdAt: "2026-04-24T00:00:00Z",
          updatedAt: "2026-04-24T00:00:00Z",
          author: { username: "reviewer" },
        },
      ],
    });

    render(<ToolReviewsPanel toolSlug="chatgpt" reviews={null} summary={null} />);

    await waitFor(() => expect(mockFetchToolReviews).toHaveBeenCalledWith("chatgpt"));
    expect(await screen.findByText("Great tool")).toBeInTheDocument();
    expect(screen.getByText("Saved correctly")).toBeInTheDocument();
  });
});
