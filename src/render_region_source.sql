function render (
    p_region              in apex_plugin.t_region,
    p_plugin              in apex_plugin.t_plugin,
    p_is_printer_friendly in boolean )
    return apex_plugin.t_region_render_result
is
    l_SellSize  apex_application_page_regions.attribute_01%type := p_region.attribute_01;
begin
    --add d3js library
    apex_javascript.add_library( p_name                  => 'd3#MIN#',
                                 p_directory             => p_plugin.file_prefix,
                                 p_check_to_add_minified => TRUE );

    APEX_CSS.ADD_FILE (p_name           => 'heatmap_calendar',
                       p_directory      => p_plugin.file_prefix,
                       p_skip_extension => false);

    -- Output the container for the calendar which is used by the Javascript code
    sys.htp.p('<div id='||apex_javascript.add_value(sys.htf.escape_sc(p_region.static_id||'_hc'), false)||'></div>');

    -- define variables for calendar
    sys.htp.p('<script type="text/javascript">');
    sys.htp.p('var cellSize = '||apex_javascript.add_value(sys.htf.escape_sc(l_SellSize), true));
    sys.htp.p('regionID = '||apex_javascript.add_value(sys.htf.escape_sc(p_region.static_id), false)||';');
    sys.htp.p('</script>');

    apex_javascript.add_library( p_name                  => 'heatmap_calendar',
                                 p_directory             => p_plugin.file_prefix,
                                 p_check_to_add_minified => false );


    return null;

end render;
