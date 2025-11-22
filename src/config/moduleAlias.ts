import moduleAlias from "module-alias";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const basePath = process.env.NODE_ENV === "production" ? "dist" : "src";
moduleAlias.addAliases({
	"@": path.join(process.cwd(), basePath),
});