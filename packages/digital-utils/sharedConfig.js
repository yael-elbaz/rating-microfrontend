// Module Federation `shared` config for digital-utils — must be identical (singleton) in the host and in every MFE.
// Consumers spread this into their ModuleFederationPlugin `shared` so the setting can't drift between projects.
module.exports = {
  "digital-utils": {
    singleton: true,
    requiredVersion: "^1.0.0",
    eager: false,
  },
  axios: { singleton: true, requiredVersion: "^1.0.0" },
};
