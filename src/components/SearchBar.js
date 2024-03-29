import * as React from "react";
import { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";

import { useRouter } from "next/router";
import { useEffect } from "react";

import PropTypes from "prop-types";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(1),
  width: "100%",
}));

const newLocal = "100%";
const newLocal_1 = "center";
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: newLocal,
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: newLocal_1,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%", // Set initial width to take up available space

    [theme.breakpoints.up("sm")]: {
      width: "13ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function SearchBar({ search }) {
  const router = useRouter();
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    if (router.pathname !== "/" || !router.pathname.startsWith("/users/")) {
      setSearchKey("");
    }
  }, [router, setSearchKey]);

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchKey(value);
    search(value); // Call the search function on every change in input value
  };

  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search items…"
        inputProps={{ "aria-label": "search" }}
        value={searchKey}
        onChange={handleSearchChange}
      />
    </Search>
  );
}

SearchBar.propTypes = {
  search: PropTypes.func.isRequired,
};
