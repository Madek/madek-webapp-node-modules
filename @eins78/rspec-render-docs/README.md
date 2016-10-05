# rspec-render-docs

render readable docs from `rspec` JSON output

⚠️ working, but experimental prototype

## TODO

dist-script/publishing so that /bin script works

## usage

currently requires a custom `rspec` spec formatter,
as more data is needed than in the built-in one.

rspec has to be instructed to use it,
which can be done using the CLI (no config changes).

when this package is installed, a few commands
are installed: `rspec-to-json` (wraps `rspec` to output data),
`rspec-render-docs` (renders docs from data)
and `rspec-to-docs` (does both).

examples:

```sh
# when installed globally:
rspec-to-docs spec/features > features.html

# using local package:
./node_modules/.bin/rspec-to-docs spec/features > features.html

# custom usage
bundle exec rspec --dry-run --order defined \
  --require "./node_modules/@eins78/rspec-render-docs/rspec/json_formatter_with_more_info.rb" \
  --format JsonFormatterWithMoreInfo \
  spec/features > features.json
./node_modules/.bin/rspec-to-docs features.json > features.html
# or pipe it: cat features.json | rspec-docs > features.html
```

# license

MIT
