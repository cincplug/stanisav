import standard from "stylelint-config-standard";

export default [
  standard,
  {
    rules: {
      "no-duplicate-selectors": true,
      "color-hex-length": "short",
      "color-named": "never",
      "property-no-vendor-prefix": true,
      "value-no-vendor-prefix": true,
      "function-url-quotes": "always",
      "font-family-name-quotes": "always-where-recommended",
      "comment-whitespace-inside": "always",
      "at-rule-no-vendor-prefix": true,
      "rule-empty-line-before": [
        "always",
        {
          except: ["first-nested"],
          ignore: ["after-comment"]
        }
      ],
      "selector-pseudo-element-colon-notation": "double",
      "selector-pseudo-class-no-unknown": true,
      "shorthand-property-no-redundant-values": true,
      "declaration-block-no-shorthand-property-overrides": true
    }
  }
];
