import express, { Router } from "express";
import bodyParser from "body-parser";
import JSONAPISerializer from "jsonapi-serializer";
import STAPIClient from "stapi-client-ts";

const apiBase = "api";
const app = express();

type ResourceApi = {
  page?: (page: number, size: number) => Promise<any>;
  search?: (
    page: number,
    size: number,
    sort: string,
    formData: any
  ) => Promise<any>;
  get: (uid: string) => Promise<any>;
};

function handleError(error: any, res: any) {
  console.log("Handling error", error);
  if (error.response) {
    res.status(error.status).json(
      new JSONAPISerializer.Error({
        code: error.response.status,
        title: "Error in response",
        detail: error?.response.data ?? "Unknown error",
      })
    );
  } else if (error.request) {
    res.status(error.status).json(
      new JSONAPISerializer.Error({
        code: error?.status,
        title: "Response not received",
        detail: error?.message ?? "Unknown error",
      })
    );
  } else {
    res.status(500).json(
      new JSONAPISerializer.Error({
        code: "500",
        title: "Internal server error",
        detail: error?.message ?? "Unknown error",
      })
    );
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", async (req, res) => {
  return res.send(`STAPI JSONAPI Service Example.`);
});

// Build routes for each resource in the STAPI client
Object.keys(STAPIClient).forEach((name: string) => {
  const uri = name
    .split(/\.?(?=[A-Z])/)
    .join("-")
    .toLowerCase();
  const api: ResourceApi = STAPIClient[name as keyof typeof STAPIClient];
  console.log(`Registering ${name} resource routes at /api/${uri}`);
  const router = Router();

  if (api.page) {
    router.get("/", (req, res) => {
      if (api.page === undefined)
        return res.status(501).send("Not implemented");

      let page = req.query.page || 1;
      let size = req.query.size || 10;

      if (typeof page !== "number") {
        page = parseInt(page as string);

        if(isNaN(page) || page < 1) {
          return res.json(
            new JSONAPISerializer.Error({
              code: "400",
              title: "Invalid page parameter",
              detail:
                "The page parameter must be an integer between 1 and the maximum pages.",
            })
          );
        }
      }

      if (typeof size !== "number") {
        size = parseInt(size as string);

        if(isNaN(size) || size < 1 || size > 100) {
          return res.json(
            new JSONAPISerializer.Error({
              code: "400",
              title: "Invalid size parameter",
              detail:
                "The size parameter must be an integer between 1 and 100.",
            })
          );
        }
      }

      api
        .page(page, size)
        .then((items) => {
          const serializer = new JSONAPISerializer.Serializer(uri, {
            attributes: Object.keys(items),
          });
          try {
            res.json(serializer.serialize(items));
          } catch (e: any) {
            res.json(
              new JSONAPISerializer.Error({
                code: "500",
                title: "Error serializing response",
                detail: e?.message ?? "Unknown error",
              })
            );
          }
        })
        .catch((error) => {
          handleError(error, res);
        });
    });

    console.log(`Mounting GET /${uri} route`);
  }

  if (api.search) {
    router.post("/", (req, res) => {
      if (api.search === undefined)
        return res.status(501).send("Not implemented");

      let page = req.query.page || 1;
      let size = req.query.size || 10;
      const sort = req.query.sort?.toString() || "uid";
      const formData = req.body;

      if (typeof page !== "number") {
        page = parseInt(page as string);
        if(isNaN(page) || page < 1) {
          // return res.status(400).send("Invalid page");
          return res.json(
            new JSONAPISerializer.Error({
              code: "400",
              title: "Invalid page parameter",
              detail:
                "The page parameter must be an integer between 1 and the maximum pages.",
            })
          );
        }
      }

      if (typeof size !== "number") {
        size = parseInt(size as string);
        if(isNaN(size) || size < 1 || size > 100) {
          // return res.status(400).send("Invalid size");
          return res.json(
            new JSONAPISerializer.Error({
              code: "400",
              title: "Invalid size parameter",
              detail:
                "The size parameter must be an integer between 1 and 100.",
            })
          );
        }
      }

      api
        .search(page, size, sort, formData)
        .then((items) => {
          const serializer = new JSONAPISerializer.Serializer(uri, {
            attributes: Object.keys(items),
          });
          try {
            res.json(serializer.serialize(items));
          } catch (e: any) {
            res.json(
              new JSONAPISerializer.Error({
                code: "500",
                title: "Error serializing response",
                detail: e?.message ?? "Unknown error",
              })
            );
          }
        })
        .catch((error) => {
          handleError(error, res);
        });
    });

    console.log(`Mounting POST /${uri} route`);
  }

  if (api.get) {
    router.get("/:id", (req, res) => {
      const id = req.params.id;

      api
        .get(id)
        .then((item) => {
          const serializer = new JSONAPISerializer.Serializer(uri, {
            attributes: Object.keys(item),
          });
          try {
            res.json(serializer.serialize(item));
          } catch (e: any) {
            res.json(
              new JSONAPISerializer.Error({
                code: "500",
                title: "Error serializing response",
                detail: e?.message ?? "Unknown error",
              })
            );
          }
        })
        .catch((error) => {
          handleError(error, res);
        });
    });

    console.log(`Mounting GET /${uri}/:uid route`);
  }

  app.use(`/${apiBase}/${uri}`, router);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
