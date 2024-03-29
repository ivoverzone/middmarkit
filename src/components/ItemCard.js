import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import PropTypes from "prop-types";
import ItemShape from "./ItemShape";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useState } from "react";

const API_VERSION = "v17.0";

export default function ItemCard({ item, page, sold, complete, isReviewer }) {
  const [postButtonDisabled, setPostButtonDisabled] = useState(false);
  const [postFailed, setPostFailed] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const handleToItems = () => {
    if (!!session) {
      router.push(`/items/${item.id}`);
    }
    if (!session) {
      router.push("/users/signin");
    }
  };

  const markAsSold = (status) => {
    const getData = async () => {
      const newItem = { ...item };
      if (status === "sold") {
        newItem.isAvailable = false;
      } else if (status === "relist") {
        newItem.isAvailable = true;
      }
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(newItem),
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      });
      if (!response.ok) {
        console.log("error");
        throw new Error(response.statusText);
      }
      const data = await response.json();

      complete(data);
    };
    getData();
  };
  const unApproveItem = () => {
    const getData = async () => {
      const newItem = { ...item };
      newItem.adminApproved = false;
      newItem.isAvailable = Boolean(newItem.isAvailable);
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(newItem),
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      });
      if (!response.ok) {
        console.log("error");
        throw new Error(response.statusText);
      }
      const data = await response.json();
      complete(data);
    };
    getData();
  };

  const postToInstagram = async () => {
    const formData = {
      image_url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload/${item.images}`,
      caption: `${item.name}\n${item.description}\nPrice: $${item.price}\n––––\ngo/middmarkit/ if you're interested!`,
      access_token: process.env.NEXT_PUBLIC_IG_ACCESS_TOKEN,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const container = `https://graph.facebook.com/v11.0/${process.env.NEXT_PUBLIC_IG_USER_ID}/media`;

    try {
      const response = await fetch(container, options);
      const data = await response.json();
      const creationId = data.id;
      const formDataPublish = {
        creation_id: creationId,
        access_token: process.env.NEXT_PUBLIC_IG_ACCESS_TOKEN,
      };
      const optionsPublish = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataPublish),
      };
      const sendinstagram = `https://graph.facebook.com/${API_VERSION}/${process.env.NEXT_PUBLIC_IG_USER_ID}/media_publish`;

      const publishResponse = await fetch(sendinstagram, optionsPublish);
      const publishData = await publishResponse.json();
      // Check if the Instagram post was published successfully
      if (publishData.id) {
        return Promise.resolve(); // Resolve the Promise to indicate successful completion
      } else {
        return Promise.reject(new Error("Failed to publish to Instagram"));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const postToMiddmarkit = async () => {
    const newItem = {
      ...item,
      datePosted: new Date().toISOString(),
      adminApproved: true,
    };
    newItem.isAvailable = Boolean(newItem.isAvailable);
    const response = await fetch(`/api/items/${item.id}`, {
      method: "PUT",
      body: JSON.stringify(newItem),
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
    });
    if (!response.ok) {
      console.log("error");
      throw new Error(response.statusText);
    }
    const data = await response.json();
    complete(data);
  };

  const postItem = async () => {
    try {
      setPostButtonDisabled(true);
      await postToInstagram();
      await postToMiddmarkit();
      setPostButtonDisabled(false);
    } catch (error) {
      console.error(error);
      setPostButtonDisabled(false);
      setPostFailed(true);
    }
  };

  const removeRelistItem = (status) => {
    const getData = async () => {
      const newItem = { ...item };

      if (status === "remove") {
        newItem.adminRemoved = true;
        newItem.isAvailable = Boolean(newItem.isAvailable);
      }
      if (status === "relist") {
        newItem.adminRemoved = false;
        newItem.adminApproved = true;
        newItem.isAvailable = Boolean(true);
      }
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(newItem),
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      });
      if (!response.ok) {
        console.log("error");
        throw new Error(response.statusText);
      }
      const data = await response.json();
      complete(data);
    };
    getData();
  };

  const remove_button = () => {
    if ((isReviewer && !sold && !item.adminRemoved) || page === "unapproved") {
      return (
        <Button
          color="warning"
          size="large"
          onClick={() => {
            removeRelistItem("remove");
          }}
        >
          Remove
        </Button>
      );
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        boxShadow: 2,
      }}
    >
      <CardMedia
        component="img"
        sx={{
          pt: "5.25%",
        }}
        image={`https://res.cloudinary.com/middmarkit/image/upload/${item.images}`}
        alt="random"
        onClick={() => handleToItems()}
      />
      <CardContent
        sx={{ display: "flex", justifyContent: "space-between", pb: 0 }}
      >
        <Typography
          gutterBottom
          variant="body2"
          noWrap
          onClick={() => handleToItems()}
          sx={{ flexGrow: 1, marginBottom: 0 }}
        >
          {item.name}
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: "auto" }}>
          ${item.price}
        </Typography>
      </CardContent>
      <CardActions>
        {page === "user" &&
          !sold &&
          !item.adminRemoved &&
          !!item.adminApproved && (
            <Button
              size="medium"
              color="warning"
              onClick={() => {
                markAsSold("sold");
              }}
            >
              Mark as Sold
            </Button>
          )}
        {remove_button()}

        {sold && (
          <Button
            color="warning"
            size="medium"
            onClick={() => markAsSold("relist")}
          >
            Relist
          </Button>
        )}

        {/* for admins to relist the item after removing it, this also automatically approves it*/}
        {page === "remove" && (
          <Button
            color="warning"
            size="medium"
            onClick={() => removeRelistItem("relist")}
          >
            Relist
          </Button>
        )}

        {page === "unapproved" && (
          <Button
            color={postFailed ? "warning" : "success"}
            size="medium"
            variant={postFailed ? "contained" : "outlined"}
            onClick={() => postItem()}
            disabled={postButtonDisabled}
          >
            Post
          </Button>
        )}

        {isReviewer && (
          <Button
            color="success"
            size="medium"
            variant="outlined"
            onClick={() => unApproveItem()}
          >
            Unapprove
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

ItemCard.propTypes = {
  item: ItemShape,
  handleClick: PropTypes.func.isRequired,
  page: PropTypes.string,
  sold: PropTypes.string,
  complete: PropTypes.func,
};
