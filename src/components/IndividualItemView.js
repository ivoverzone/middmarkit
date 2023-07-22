import PropTypes from "prop-types";
import ItemShape from "./ItemShape";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function IndividualItemView({ item }) {
  const { data: session } = useSession();
  const public_id = item.images;
  const router = useRouter();
  return (
    <Grid container spacing={2} justifyContent="center" justify="center">
      <Grid item xs={12} sm="auto" alignItems="center">
        <Card sx={{ maxWidth: "400px" }}>
          <CardMedia
            component="img"
            style={{ height: "400" }}
            image={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload/${public_id}`}
          />
        </Card>
      </Grid>
      <Grid item xs={12} sm>
        <Container>
          <Typography variant="h4" align="left">
            {item.name}
          </Typography>
          <Typography variant="h5" align="left">
            ${item.price}
          </Typography>
          <Typography variant="subtitle1" align="left">
            {item.description}
          </Typography>
          {session && item && session.user.id === item.sellerId && (
            <Button
              size="medium"
              sx={{ my: 2 }}
              variant="outlined"
              onClick={() => {
                router.push(`/items/${item.id}/edit`);
              }}
            >
              Edit item
            </Button>
          )}
        </Container>
      </Grid>
    </Grid>
  );
}

IndividualItemView.propTypes = {
  item: ItemShape,
  handleClick: PropTypes.func,
};
