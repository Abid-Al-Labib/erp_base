import NavigationBar from "@/components/customui/NavigationBar";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const DisabledPage = () => {
  return (
    <>
      <NavigationBar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card shadow-xl p-8 rounded-2xl max-w-md text-center border"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="p-3 rounded-full bg-muted shadow-md shadow-muted"
            >
              <XCircle className="text-muted-foreground w-10 h-10" />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Feature Disabled
          </h1>
          <p className="text-muted-foreground mb-6">
            This feature is currently disabled by the administrator.
          </p>
          <a
            href="/"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition"
          >
            Go to Home
          </a>
        </motion.div>
      </div>
    </>
  );
};

export default DisabledPage;
