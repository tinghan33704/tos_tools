const tool_id = 'craft';

let filter_set = new Set();
let or_filter = true;
let theme = 'normal';

$(document).ready(function(){
    init();
    
    if(location.search) readUrl();
});

$(window).resize(function(){
    $('.side_navigation').css({top: (parseInt($('#top-bar').css('height'))-20)+'px'});
});

function startFilter()
{
    changeUrl();
    
    let skill_set = new Set();
    let mode_set = new Set();
    let attr_set = new Set();
    let race_set = new Set();
    let star_set = new Set();
    let charge_set = new Set();
    
    let isSkillSelected = false;
    let isModeSelected = false;
    let isAttrSelected = false;
    let isRaceSelected = false;
    let isStarSelected = false;
    let isChargeSelected = false;
    
    filter_set.clear();
	let keyword_set = checkKeyword();

	[skill_set, isSkillSelected] = getSelectedButton('filter');
	[mode_set, isModeSelected] = getSelectedButton('mode');
	[attr_set, isAttrSelected] = getSelectedButton('attr');
	[race_set, isRaceSelected] = getSelectedButton('race');
	[star_set, isStarSelected] = getSelectedButton('star', true);
	[charge_set, isChargeSelected] = getSelectedButton('charge');
	
	$.each(craft_data, (index, craft) => {
		if( (isModeSelected && !mode_set.has(craft.mode)) || 
			(isAttrSelected && !attr_set.has(craft.attribute)) || 
			(isRaceSelected && !race_set.has(craft.race)) || 
			(isStarSelected && !star_set.has(craft.star)) || 
			(isChargeSelected && !charge_set.has(craft.charge))) return;
			
		if(isSkillSelected || keyword_set.size > 0) {
			let skill_num_array = [];
			
			if(or_filter)       // OR
			{
				// Check for skill tags
				let isSkillMatch = false;
				$.each([...skill_set], (skill_set_index, selected_feat) => {
					if(craft.tag.includes(selected_feat)) {
						isSkillMatch = true;
						return false;
					}
				})
				
				if(!isSkillMatch && keyword_set.size == 0) return;
				
				// Check for keywords
				if(!isSkillMatch && keyword_set.size > 0) {
					let isKeywordChecked = false;
					
					$.each([...keyword_set], (keyword_index, keyword) => {
						$.each(craft.description, (desc_index, desc) => {
							const sanitized_skill_desc = textSanitizer(desc);
							if(sanitized_skill_desc.includes(keyword))
							{
								isKeywordChecked = true;
								return false;
							}
						})
						
						if(isKeywordChecked) return false;
					})
					
					if(!isKeywordChecked) return;
				}
			}
			else       // AND
			{
				// Check for skill tags
				let isSkillMatch = true;
				
				$.each([...skill_set], (skill_set_index, selected_feat) => {
					if(!(craft.tag.includes(selected_feat))) {
						isSkillMatch = false;
						return false;
					}
				})
				
				if(!isSkillMatch) return;
				
				// Check for keywords
				let isAllKeywordChecked = true;
				$.each([...keyword_set], (keyword_index, keyword) => {
					let isKeywordChecked = false;
					$.each(craft.description, (desc_index, desc) => {
						const sanitized_skill_desc = textSanitizer(desc);
						if(sanitized_skill_desc.includes(keyword))
						{
							isKeywordChecked = true;
							return false;
						}
					})
					
					if(!isKeywordChecked) {
						isAllKeywordChecked = false;
						return false;
					}
				})
				
				if(!isAllKeywordChecked) return;
			}
		}
		craft.tag.length > 0 && filter_set.add(craft.id);
	})
    
    
    $(".row.result-row").show();
    
    let craft_array = [...filter_set];
    
    $("#result-row").html(() => {
        let str = "";
            
        if(craft_array.length != 0)
        {
            craft_array.sort((a, b) => a - b);
            $.each(craft_array, (index, craft_id) => {
                let sk_str = renderCraftInfo(craft_id);
                str += renderCraftImage(craft_id, sk_str);
            });
        }
        else
        {
            str = `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h1>查無結果</h1></div>`;
        }
        return str;
    });
    
    $('.result').tooltip(
        {
            boundary: 'scrollParent', 
            placement: 'auto', 
            container: 'body'
        }
    );
    
    $(".search_tag").html(function(){
        let tag_html = "";
        
        tag_html += renderTags(skill_set, 'skill');
        tag_html += renderTags(keyword_set, 'keyword');
        tag_html += renderTags(mode_set, 'genre');
        tag_html += renderTags(attr_set, 'genre');
        tag_html += renderTags(race_set, 'genre');
        tag_html += renderTags(star_set, 'genre', ' ★');
        tag_html += renderTags(charge_set, 'genre');
        
        return tag_html;
    });
    
    $('[data-toggle=popover]').popover({
        container: 'body',
        html: true,
        trigger: 'focus',
        placement: 'bottom'
    });
    
    jumpTo("result_title");
}

function renderCraftInfo(craft_id) {
    let sk_str = "";
    let skill = craft_data.find((element) => {
        return element.id == craft_id;
    }).description;
    
    $.each(skill, (desc_index, desc) => {
        if(desc_index > 0) sk_str += `<hr style='margin: 5px 0;'>`;
    
        sk_str += `
            <div class='skill_tooltip skill_description'>
                <img src='../tos_tool_data/img/craft/skill_${desc_index + 1}.png' />
                &nbsp;${desc}
            </div>
        `;
    });
    
    return sk_str;
}

function renderCraftImage(craft_id, sk_str) {
    return `
        <div class="col-3 col-md-2 col-lg-1 result">
            <img class="monster_img" src="../tos_tool_data/img/craft/${craft_id}.png" onerror="this.src='../tos_tool_data/img/craft/noname.png'" tabindex=${craft_id} data-toggle="popover" data-title="" data-content="${sk_str}"></img>
            <div class="monsterId">
                <a href="https://tos.fandom.com/zh/wiki/C${paddingZeros(craft_id, 2)}" target="_blank">
                    ${paddingZeros(craft_id, 3)}
                </a>
            </div>
        </div>
    `;
}
