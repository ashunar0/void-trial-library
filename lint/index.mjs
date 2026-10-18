/**
 * This app's own lint rules (an oxlint JS plugin, loaded in vite.config.ts)
 */

/**
 * The clock is read at the entry points (pages/*.server.ts, routes/, crons/, queues/).
 * src/ takes now as an argument, so tests can fix it. vite.config.ts decides where this applies.
 * new Date(value) converts a value, so it is not the clock
 */
const noClock = {
  create(context) {
    const report = (node, what) =>
      context.report({
        node,
        message: `${what} reads the clock. Read it in the loader or action and pass now as an argument`,
      });

    return {
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "Date" &&
          node.arguments.length === 0
        )
          report(node, "new Date()");
      },
      CallExpression(node) {
        const { callee } = node;
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "Date" &&
          callee.property.name === "now"
        )
          report(node, "Date.now()");
      },
    };
  },
};

export default {
  meta: { name: "library" },
  rules: { "no-clock": noClock },
};
