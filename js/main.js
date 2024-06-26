import { loadStylesheets, loadPageElements } from "./pageBuilder.js";
import { loadEventListeners } from "./eventListeners.js";
import { loadUserPreferences } from "./userPreferences.js";

// from "FluentUI/Web-Component (...) example" <https://codepen.io/0xtadash1/pen/qBVXPqz>
import {
  provideFluentDesignSystem,
  allComponents
} from "https://unpkg.com/@fluentui/web-components";

provideFluentDesignSystem()
  .register(allComponents);

// load Stylesheets and Page Elements
loadStylesheets();
loadPageElements();
// load Event Listeners and User Preferences
loadEventListeners();
loadUserPreferences();
