const fs = require("fs");
const path = require("path");

const prefersXML = (request) => {
  const accept = request.headers.accept || "";
  return accept.includes("application/xml") || accept.includes("text/xml");
};

const writeJSON = (response, status, obj) => {
  const body = JSON.stringify(obj);
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(body);
};

const toXMLString = (obj, isError = false) => {
  const message = obj.message ? `<message>${obj.message}</message>` : "";
  const id = isError && obj.id ? `<id>${obj.id}</id>` : "";
  return `<?xml version="1.0" encoding="UTF-8"?><response>${message}${id}</response>`;
};

const writeXML = (response, status, obj, isError = false) => {
  const body = toXMLString(obj, isError);
  response.writeHead(status, { "Content-Type": "application/xml" });
  response.end(body);
};

const respond = (request, response, status, obj, isError = false) => {
  if (prefersXML(request)) {
    writeXML(response, status, obj, isError);
  } else {
    writeJSON(response, status, obj);
  }
};

const getClient = (request, response) => {
  const filePath = path.join(__dirname, "../client/client.html");
  try {
    const html = fs.readFileSync(filePath);
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(html);
  } catch (err) {
    writeJSON(response, 500, {
      message: "Unable to load client.html :(",
      id: "internalError",
    });
  }
};

const getCSS = (request, response) => {
  const filePath = path.join(__dirname, "../style.css");
  try {
    const css = fs.readFileSync(filePath);
    response.writeHead(200, { "Content-Type": "text/css" });
    response.end(css);
  } catch (err) {
    writeJSON(response, 500, {
      message: "Unable to load style.css :(",
      id: "internalError",
    });
  }
};

const handleSuccess = (request, response) => {
  respond(request, response, 200, {
    message: "This is a successful response!! :)",
  });
};

const handleBadRequest = (request, response, query) => {
  if (query && query.valid === "true") {
    respond(request, response, 200, {
      message: "This request has the required parameters!",
    });
  } else {
    respond(
      request,
      response,
      400,
      {
        message: "Missing valid query parameter set to true...",
        id: "badRequest",
      },
      true
    );
  }
};

const handleUnauthorized = (request, response, query) => {
  if (query && query.loggedIn === "yes") {
    respond(request, response, 200, {
      message: "You have successfully viewed the content!! Congrats!!",
    });
  } else {
    respond(
      request,
      response,
      401,
      {
        message: "Missing loggedIn query parameter set to yes...",
        id: "unauthorized",
      },
      true
    );
  }
};

const handleForbidden = (request, response) => {
  respond(
    request,
    response,
    403,
    { message: "You do not have access to this content...", id: "forbidden" },
    true
  );
};

const handleInternal = (request, response) => {
  respond(
    request,
    response,
    500,
    {
      message: "Internal Server Error. Something went wrong. :(",
      id: "internalError",
    },
    true
  );
};

const handleNotImplemented = (request, response) => {
  respond(
    request,
    response,
    501,
    {
      message:
        "A get request for this page has not been implemented yet, please check again later for updated content!!",
      id: "notImplemented",
    },
    true
  );
};

const handleNotFound = (request, response) => {
  respond(
    request,
    response,
    404,
    {
      message: "The page you are looking for was not found... :(",
      id: "notFound",
    },
    true
  );
};

module.exports = {
  getClient,
  getCSS,
  handleSuccess,
  handleBadRequest,
  handleUnauthorized,
  handleForbidden,
  handleInternal,
  handleNotImplemented,
  handleNotFound,
};
