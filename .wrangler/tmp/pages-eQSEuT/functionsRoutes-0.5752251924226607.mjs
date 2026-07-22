import { onRequestGet as __api_user_revision_stats_js_onRequestGet } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\user\\revision\\stats.js"
import { onRequestPost as __api_user_revision_submit_js_onRequestPost } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\user\\revision\\submit.js"
import { onRequestPost as __api_admin_rebuild__id__js_onRequestPost } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\admin\\rebuild\\[id].js"
import { onRequestPost as __api_quiz__id__submit_js_onRequestPost } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\quiz\\[id]\\submit.js"
import { onRequestPost as __api_admin_rebuild_all_js_onRequestPost } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\admin\\rebuild-all.js"
import { onRequestGet as __api_user_revision_index_js_onRequestGet } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\user\\revision\\index.js"
import { onRequestGet as __api_quiz__id__js_onRequestGet } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\quiz\\[id].js"
import { onRequest as __api__table__js_onRequest } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\[table].js"
import { onRequest as __api__middleware_js_onRequest } from "C:\\Users\\bhave\\cgpsc-quiz\\functions\\api\\_middleware.js"

export const routes = [
    {
      routePath: "/api/user/revision/stats",
      mountPath: "/api/user/revision",
      method: "GET",
      middlewares: [],
      modules: [__api_user_revision_stats_js_onRequestGet],
    },
  {
      routePath: "/api/user/revision/submit",
      mountPath: "/api/user/revision",
      method: "POST",
      middlewares: [],
      modules: [__api_user_revision_submit_js_onRequestPost],
    },
  {
      routePath: "/api/admin/rebuild/:id",
      mountPath: "/api/admin/rebuild",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_rebuild__id__js_onRequestPost],
    },
  {
      routePath: "/api/quiz/:id/submit",
      mountPath: "/api/quiz/:id",
      method: "POST",
      middlewares: [],
      modules: [__api_quiz__id__submit_js_onRequestPost],
    },
  {
      routePath: "/api/admin/rebuild-all",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_rebuild_all_js_onRequestPost],
    },
  {
      routePath: "/api/user/revision",
      mountPath: "/api/user/revision",
      method: "GET",
      middlewares: [],
      modules: [__api_user_revision_index_js_onRequestGet],
    },
  {
      routePath: "/api/quiz/:id",
      mountPath: "/api/quiz",
      method: "GET",
      middlewares: [],
      modules: [__api_quiz__id__js_onRequestGet],
    },
  {
      routePath: "/api/:table",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api__table__js_onRequest],
    },
  {
      routePath: "/api",
      mountPath: "/api",
      method: "",
      middlewares: [__api__middleware_js_onRequest],
      modules: [],
    },
  ]