
import { fileURLToPath } from "url";
import { dirname } from "path";


const expressfilename = fileURLToPath(import.meta.url);
export const staticImgPath = dirname(expressfilename);

