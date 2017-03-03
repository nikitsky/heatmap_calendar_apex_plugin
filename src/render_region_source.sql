function render (
    p_region              in apex_plugin.t_region,
    p_plugin              in apex_plugin.t_plugin,
    p_is_printer_friendly in boolean )
    return apex_plugin.t_region_render_result
is
    l_SellSize      apex_application_page_regions.attribute_01%type := p_region.attribute_01;
    l_FirstYear     apex_application_page_regions.attribute_05%type := p_region.attribute_05;
    l_Periods       apex_application_page_regions.attribute_06%type := p_region.attribute_06;
    l_dateFormat    apex_application_page_regions.attribute_07%type := p_region.attribute_07;
    l_legendType    apex_application_page_regions.attribute_08%type := p_region.attribute_08;

    l_StartValue    apex_application_page_regions.attribute_09%type := p_region.attribute_09;
    l_StartColour   apex_application_page_regions.attribute_10%type := p_region.attribute_10;
    l_endValue      apex_application_page_regions.attribute_11%type := p_region.attribute_11;
    l_EndColour     apex_application_page_regions.attribute_12%type := p_region.attribute_12;

    l_tooltipEnabled boolean;
    l_jscode        VARCHAR2(32000);
begin

    l_tooltipEnabled := p_region.attribute_14 = 'Y';

    APEX_CSS.ADD_FILE (p_name           => 'heatmap_calendar',
                       p_directory      => p_plugin.file_prefix,
                       p_skip_extension => false);

    --add d3js library
    apex_javascript.add_library( p_name                  => 'd3',
                                 p_directory             => p_plugin.file_prefix,
                                 p_check_to_add_minified => TRUE );

    apex_javascript.add_library( p_name                  => 'heatmap_calendar',
                                 p_directory             => p_plugin.file_prefix,
                                 p_check_to_add_minified => TRUE);

    -- Output the container for the calendar which is used by the Javascript code
    sys.htp.p('<div id='||apex_javascript.add_value(sys.htf.escape_sc(p_region.static_id||'_hc'), false)||'></div>');

    -- define variables for calendar
    l_jscode :='heatmap_calendar('||
            apex_javascript.add_value(p_region.static_id)||
            '{'||
                apex_javascript.add_attribute(
                    p_name      => 'ajaxIdentifier',
                    p_value     => apex_plugin.get_ajax_identifier,
                    p_omit_null => false,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'cellSize',
                    p_value     => sys.htf.escape_sc(l_SellSize),
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'firstYear',
                    p_value     => sys.htf.escape_sc(l_FirstYear),
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'periods',
                    p_value     => sys.htf.escape_sc(coalesce(l_Periods,1)),
                    p_omit_null => false,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'dateFormat',
                    p_value     => sys.htf.escape_sc(l_dateFormat),
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'legendType',
                    p_value     => sys.htf.escape_sc(l_legendType),
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'startValue',
                    p_value     => sys.htf.escape_sc(l_StartValue),
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'startColor',
                    p_value     => sys.htf.escape_sc(l_StartColour),
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'endValue',
                    p_value     => sys.htf.escape_sc(l_endValue),
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'tooltipEnabled',
                    p_value     => l_tooltipEnabled,
                    p_omit_null => true,
                    p_add_comma => true
                )||
                apex_javascript.add_attribute(
                    p_name      => 'endColor',
                    p_value     => sys.htf.escape_sc(l_EndColour),
                    p_omit_null => true,
                    p_add_comma => false
                )||
            '}';
    if p_region.init_javascript_code is not null then
        l_jscode :=l_jscode||','||p_region.init_javascript_code||');';
    else
        l_jscode :=l_jscode||');';
    end if;
    apex_javascript.add_onload_code (
        p_code => l_jscode
    );

    return null;

end render;
