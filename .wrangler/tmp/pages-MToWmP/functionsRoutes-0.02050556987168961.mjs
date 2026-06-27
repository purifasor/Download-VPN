import { onRequestGet as __api_version_js_onRequestGet } from "/home/user/webapp/functions/api/version.js"
import { onRequest as __api_download_js_onRequest } from "/home/user/webapp/functions/api/download.js"

export const routes = [
    {
      routePath: "/api/version",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_version_js_onRequestGet],
    },
  {
      routePath: "/api/download",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_download_js_onRequest],
    },
  ]