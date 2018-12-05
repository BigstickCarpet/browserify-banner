"use strict";

const fs = require("fs");
const spawnSync = require("child_process").spawnSync;
const inspectBundle = require("../fixtures/inspect-bundle");
require("chai").should();

describe("Browserify CLI + banner", function () {
  before("Make sure browserify-banner is in node_modules", () => {
    if (!fs.existsSync("node_modules/browserify-banner")) {
      throw new Error('node_modules/browserify-banner does not exist.  Try running "npm link browserify-banner"');
    }
  });

  it("should use the default banner file", function (done) {
    let output = spawnSync(
      "node", [
        "--no-warnings",
        "node_modules/browserify/bin/cmd.js",
        "test/test-apps/has-banner/index.js",
        "--outfile", "test/test-apps/has-banner/dist/bundle.js",
        "--standalone", "Fizz.Buzz",
        "--plugin", "browserify-banner"
      ]);

    output.should.not.have.property("error");
    output.stdout.toString().should.be.empty;
    output.stderr.toString().should.be.empty;
    output.status.should.equal(0);

    // The bundle should start with the banner from "alt-banner.txt",
    // followed by the UMD prelude and postlude,
    // with the Browserify prelude and postlude in-between,
    // and then our modules in-between that,
    // and finally, the sourcemap at the end
    let bundle = fs.readFileSync("test/test-apps/has-banner/dist/bundle.js", "utf8");
    inspectBundle(bundle, {
      parts: [
        "banner", "umd prelude", "prelude", "modules", "postlude", "umd postlude"
      ],
    });

    done();
  });

  it("should use an alternate banner file", function (done) {
    let output = spawnSync(
      "node", [
        "--no-warnings",
        "node_modules/browserify/bin/cmd.js",
        "test/test-apps/has-banner/index.js",
        "--outfile", "test/test-apps/has-banner/dist/bundle.js",
        "--standalone", "Fizz.Buzz",
        "--plugin", "[", "browserify-banner",
        "--file", "test/test-apps/has-banner/alt-banner.txt", "]"
      ]);

    output.should.not.have.property("error");
    output.stdout.toString().should.be.empty;
    output.status.should.equal(0);

    // The bundle should start with the banner from "alt-banner.txt",
    // followed by the UMD prelude and postlude,
    // with the Browserify prelude and postlude in-between,
    // and then our modules in-between that,
    // and finally, the sourcemap at the end
    let bundle = fs.readFileSync("test/test-apps/has-banner/dist/bundle.js", "utf8");
    inspectBundle(bundle, {
      parts: [
        "banner", "umd prelude", "prelude", "modules", "postlude", "umd postlude"
      ],
    });

    done();
  });

  it("should use an alternate package file", function (done) {
    let output = spawnSync(
      "node", [
        "--no-warnings",
        "node_modules/browserify/bin/cmd.js",
        "test/test-apps/has-banner/index.js",
        "--outfile", "test/test-apps/has-banner/dist/bundle.js",
        "--standalone", "Fizz.Buzz",
        "--plugin", "[", "browserify-banner",
        "--pkg", "test/test-apps/has-banner/alt-package.json", "]"
      ]);

    output.should.not.have.property("error");
    output.stdout.toString().should.be.empty;
    output.status.should.equal(0);

    // The bundle should start with the banner from "banner.txt",
    // followed by the UMD prelude and postlude,
    // with the Browserify prelude and postlude in-between,
    // and then our modules in-between that,
    // and finally, the sourcemap at the end
    let bundle = fs.readFileSync("test/test-apps/has-banner/dist/bundle.js", "utf8");
    inspectBundle(bundle, {
      parts: [
        "banner", "umd prelude", "prelude", "modules", "postlude", "umd postlude"
      ],
    });

    // The banner should contain the data from alt-package.json instead of package.json
    bundle.should.match(/\* Alternate World v9.87.654/);

    done();
  });

  it("should use an inline banner template", function (done) {
    let output = spawnSync(
      "node", [
        "--no-warnings",
        "node_modules/browserify/bin/cmd.js",
        "test/test-apps/has-banner/index.js",
        "--outfile", "test/test-apps/has-banner/dist/bundle.js",
        "--standalone", "Fizz.Buzz",
        "--plugin", "[", "browserify-banner",
        "--template", "This package was written by <%= pkg.author.name %>", "]"
      ]);

    output.should.not.have.property("error");
    output.stdout.toString().should.be.empty;
    output.status.should.equal(0);

    // The bundle should start with our custom banner text,
    // followed by the UMD prelude and postlude,
    // with the Browserify prelude and postlude in-between,
    // and then our modules in-between that,
    // and finally, the sourcemap at the end
    let bundle = fs.readFileSync("test/test-apps/has-banner/dist/bundle.js", "utf8");
    inspectBundle(bundle, {
      parts: [
        "banner", "umd prelude", "prelude", "modules", "postlude", "umd postlude"
      ],
    });

    // The banner should contain the data from alt-package.json instead of package.json
    bundle.should.match(/\* This package was written by John Doe\n/);

    done();
  });
});
