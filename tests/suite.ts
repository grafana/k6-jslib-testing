import { defineSuite } from "../dist/index.js";

import "./expectations/toBeInstanceOf.ts";
import "./expectations/toHaveAttribute.ts";

const { options, runSuite } = defineSuite({});

export default runSuite;

export { options };
