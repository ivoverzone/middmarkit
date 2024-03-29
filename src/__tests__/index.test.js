import Album from "@/pages";
import App from "@/pages/_app";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useSession, SessionProvider } from "next-auth/react";
import fetchMock from "fetch-mock-jest";
import mockRouter from "next-router-mock";

jest.mock("next/router", () => require("next-router-mock"));
jest.mock("next-auth/react");
global.gtag = jest.fn();

describe("Client-side testing for index.js", () => {
  beforeEach(() => {
    fetchMock.get("/api/users/1", () => {
      return {
        firstName: "Alina",
        lastName: "Zatzick",
        email: "azatzick@middlebury.edu",
        reviewerStatus: true,
      };
    });
    fetchMock.get("/api/items", () => {
      return [];
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
    fetchMock.reset();
  });

  test("Render app with session provider", async () => {
    SessionProvider.mockImplementation(({ children }) => (
      <mock-provider>{children}</mock-provider>
    ));
    useSession.mockReturnValue({
      data: {
        user: { id: 1 },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: "authenticated",
    });

    // Set the session prop expected by our _app component
    render(<App Component={Album} pageProps={{ session: undefined }} />);
    expect(
      screen.getByText(/Welcome to the Middlebury Resale Community!/i)
    ).toBeInTheDocument();

    await act(async () => {
      await new Promise(process.nextTick);
    });
  });

  test("Renders secure portions of page when logged in", async () => {
    useSession.mockReturnValue({
      data: {
        user: { id: 1 },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: "authenticated",
    });
    render(<Album />);
    expect(useSession).toBeCalled();
    expect(screen.getByText(/Midd Markit/)).toBeInTheDocument();

    await act(async () => {
      await new Promise(process.nextTick);
    });
  });

  test("Clicking 'Sell' button navigates to seller page", async () => {
    SessionProvider.mockImplementation(({ children }) => (
      <mock-provider>{children}</mock-provider>
    ));
    useSession.mockReturnValue({
      data: {
        user: { id: 1 },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: "authenticated",
    });
    render(<App Component={Album} pageProps={{ session: undefined }} />);
    const button = await screen.findByRole("button", { name: /Sell/i });
    fireEvent.click(button);
    expect(mockRouter.asPath).toBe("/items/new");

    await act(async () => {
      await new Promise(process.nextTick);
    });
  });
});
