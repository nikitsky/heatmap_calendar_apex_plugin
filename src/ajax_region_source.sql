function ajax (
    p_region in apex_plugin.t_region,
    p_plugin in apex_plugin.t_plugin
) return apex_plugin.t_region_ajax_result
is
    -- It's better to have named variables instead of using the generic ones,
    -- makes the code more readable. We are using the same defaults for the
    -- required attributes as in the plug-in attribute configuration, because
    -- they can still be null. Keep them in sync!
    c_day_column          constant varchar2(255) := p_region.attribute_02;
    c_value_column        constant varchar2(255) := p_region.attribute_03;
    c_label_column        constant varchar2(255) := p_region.attribute_13;

    l_day_column_no          pls_integer;
    l_value_column_no        pls_integer;
    l_label_column_no        pls_integer;

    l_column_value_list      apex_plugin_util.t_column_value_list2;

    l_value             varchar2(4000);
    l_class             varchar2(255);

begin
    apex_json.initialize_output (
        p_http_cache => false );
        -- Read the data based on the region source query
    l_column_value_list := apex_plugin_util.get_data2 (
                               p_sql_statement  => p_region.source,
                               p_min_columns    => 2,
                               p_max_columns    => null,
                               p_component_name => p_region.name );

    -- Get the actual column# for faster access and also verify that the data type
    -- of the column matches with what we are looking for
    l_day_column_no := apex_plugin_util.get_column_no (
                            p_attribute_label   => 'Date column',
                            p_column_alias      => c_day_column,
                            p_column_value_list => l_column_value_list,
                            p_is_required       => true,
                            p_data_type         => apex_plugin_util.c_data_type_date
    );

    l_value_column_no   := apex_plugin_util.get_column_no (
                            p_attribute_label   => 'Value column',
                            p_column_alias      => c_value_column,
                            p_column_value_list => l_column_value_list,
                            p_is_required       => true,
                            p_data_type         => apex_plugin_util.c_data_type_number
    );
    l_label_column_no   := apex_plugin_util.get_column_no (
                            p_attribute_label   => 'Label column',
                            p_column_alias      => c_label_column,
                            p_column_value_list => l_column_value_list,
                            p_is_required       => true,
                            p_data_type         => apex_plugin_util.c_data_type_varchar2
    );

    -- begin output as json
    owa_util.mime_header('application/json', false);
    htp.p('cache-control: no-cache');
    htp.p('pragma: no-cache');
    owa_util.http_header_close;
 --   l_message_when_no_data_found := apex_escape.html_whitelist(
  --      apex_plugin_util.replace_substitutions (
   --             p_value  => c_message_when_no_data_found,
   --             p_escape => false
    --        )
    --    );
    apex_json.open_object();
    apex_json.open_array('dateData');
    for l_row_num in 1 .. l_column_value_list(1).value_list.count loop
        begin
            apex_json.open_object();
            -- Set the column values of our current row so that apex_plugin_util.replace_substitutions
            -- can do substitutions for columns contained in the region source query.
            apex_plugin_util.set_component_values (
                p_column_value_list => l_column_value_list,
                p_row_num           => l_row_num );

            -- get the day
            l_value := apex_plugin_util.get_value_as_varchar2 (
                               p_data_type   => l_column_value_list(l_day_column_no).data_type,
                               p_value       => l_column_value_list(l_day_column_no).value_list(l_row_num),
                               p_format_mask => 'YYYYMMDD');

            apex_json.write('date', l_value);

            -- get the value
            l_value := apex_plugin_util.get_value_as_varchar2 (
                               p_data_type => l_column_value_list(l_value_column_no).data_type,
                               p_value     => l_column_value_list(l_value_column_no).value_list(l_row_num) );

            apex_json.write(
                p_name       => 'value',
                p_value      => to_number(l_value),
                p_write_null => false);


            -- get the label
            l_value := apex_plugin_util.get_value_as_varchar2 (
                               p_data_type   => l_column_value_list(l_label_column_no).data_type,
                               p_value       => l_column_value_list(l_label_column_no).value_list(l_row_num) );

            apex_json.write('label', l_value);

            apex_json.close_object();

            apex_plugin_util.clear_component_values;
        exception when others then
            apex_plugin_util.clear_component_values;
            raise;
        end;
    end loop;
    apex_json.close_all();

    return null;
exception when others then
    htp.p('error: '||apex_escape.html(sqlerrm));
    return null;
end ajax;

