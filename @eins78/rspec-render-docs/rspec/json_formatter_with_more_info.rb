# extends the RSpec JSON formatter to output more information
# - top-level: git info
# - examples: source and (custom) metadata
class JsonFormatterWithMoreInfo < RSpec::Core::Formatters::JsonFormatter
  RSpec::Core::Formatters.register self

  private

  def initialize(output)
    super
    @output_hash[:git_commit] = `git log -n1 --format="%h"`.chomp
    @output_hash[:git_tree] = `git log -n1 --format="%T"`.chomp
  end

  def format_example(example)
    # keys we want from example.metadata:
    rspec_attrs = [:scoped_id, :type]
    our_attrs = [:browser, :steps]
    # keys we want from example.metadata.example_group:
    rspec_group_attrs = [
      :scoped_id, :parent_example_group, :description, :full_description]

    meta = example.metadata
    src = meta[:block].try(:source)

    more_info = meta
      .slice(*(rspec_attrs + our_attrs))
      .merge(
        example_group: (meta[:example_group] || {}).slice(*rspec_group_attrs),
        source: src,
        source_block: extract_ruby_block_source(src))

    super(example).merge(more_info)
  end

  # totally private
  def extract_ruby_block_source(str)
    # gets just the source from the block argument of a method call (`do … end`)
    return unless str.is_a?(String)
    str.sub(/\A.*do\s*(\|\s*\w*\s?\|)?\s*$/, '').sub(/end\s*\z/, '')
      .strip_heredoc.strip
  end
end
