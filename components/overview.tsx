import { motion } from 'framer-motion';
import { Globe, MessageSquare } from 'lucide-react';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <Globe className="size-8 text-blue-500" />
          <span>+</span>
          <MessageSquare className="size-8 text-purple-500" />
        </p>
        <p>
          Welcome to <span className="font-semibold">Stable Station</span> — your AI assistant
          for stablecoins and real world assets. Ask me about getting stablecoins,
          setting up social profiles, managing your portfolio, or anything else
          in the onchain world.
        </p>
        <p className="text-sm text-muted-foreground">
          Type a message below to get started, or try one of the suggested prompts.
        </p>
      </div>
    </motion.div>
  );
};
