const tool_id = 'team_skill';

let filter_set = new Set();
let or_filter = 'or';
let or_filter_value = ['or', 'and'];
let theme = 'normal';
let display_mode = 'row';

let settings = [
	{
		id: 'changeTheme-btn',
		className: 'changeTheme',
		content: "<i class='fa fa-adjust'></i>",
		callback: 'changeTheme()',
		description: '淺色主題',
		hideAfterClick: false,
	}
]

$(document).ready(function(){
    init();
    
    location.search && readUrl();
});

function startFilter()
{
    changeUrl();
    
    let skill_set = new Set();
    let attr_set = new Set();
    let race_set = new Set();
    let star_set = new Set();
    let activate_set = new Set();
    
    let isSkillSelected = false;
    let isAttrSelected = false;
    let isRaceSelected = false;
    let isStarSelected = false;
    let isActivateSelected = false;
    
    filter_set.clear();

	[skill_set, isSkillSelected] = getSelectedButton('filter');
	[attr_set, isAttrSelected] = getSelectedButton('attr');
	[race_set, isRaceSelected] = getSelectedButton('race');
	[star_set, isStarSelected] = getSelectedButton('star', true);
	[activate_set, isActivateSelected] = getSelectedButton('activate');
	
	let keyword_set = checkKeyword();
	
	let alias_skill_set = addAlias(skill_set, [...keyword_set])
	
	$.each(monster_data, (index, monster) => {
		if( (!monster.star || monster.star <= 0) ||
			(isAttrSelected && !attr_set.has(monster.attribute)) || 
			(isRaceSelected && !race_set.has(monster.race)) || 
			(isStarSelected && !star_set.has(monster.star))) return;
			
		if(isSkillSelected || keyword_set.size > 0) {
			let skill_num_array = [];
			
			$.each(monster.teamSkill, (skill_index, monster_skill) => {
				if(isActivateSelected && !hasActivateTag(activate_set, monster_skill)) return;
				
				if(or_filter === 'or')       // OR
				{
					// Check for skill tags
					let isSkillMatch = false;
					
					$.each([...skill_set, ...alias_skill_set], (skill_set_index, selected_feat) => {
						if(monster_skill.skill_tag.includes(selected_feat)) {
							isSkillMatch = true;
							return false;
						}
					})
					
					if(!isSkillMatch && keyword_set.size == 0) return;
					
					// Check for keywords
					if(!isSkillMatch && keyword_set.size > 0) {
						let isKeywordChecked = false;
						const skill_desc = textSanitizer(monster_skill.description);
						
						$.each([...keyword_set], (keyword_index, keyword) => {
							if(skill_desc.includes(keyword))
							{
								isKeywordChecked = true;
								return false;
							}
						})
						
						if(!isKeywordChecked) return;
					}
				}
				else       // AND
				{
					// Check for skill tags
					let isSkillMatch = true;
					
					$.each([...skill_set, ...alias_skill_set], (skill_set_index, selected_feat) => {
						if(!(monster_skill.skill_tag.includes(selected_feat))) {
							isSkillMatch = false;
							return false;
						}
					})
					
					if(!isSkillMatch) return;
					
					// Check for keywords
					let isKeywordChecked = true;
					let skill_desc = textSanitizer(monster_skill.description);
					
					$.each([...keyword_set], (keyword_index, keyword) => {
						if(!skill_desc.includes(keyword))
						{
							isKeywordChecked = false;
							return false;
						}
					})
					
					if(!isKeywordChecked) return;
				}
				
				skill_num_array.push(skill_index);
			})
			
			if(skill_num_array.length > 0) filter_set.add({'id': monster.id, 'nums': skill_num_array});
		}
		else {
			let skill_num_array = [];
			
			$.each(monster.teamSkill, (skill_index, monster_skill) => {
				if(isActivateSelected && !hasActivateTag(activate_set, monster_skill)) return;
				
				skill_num_array.push(skill_index);
			})
			
			if(skill_num_array.length > 0) filter_set.add({'id': monster.id, 'nums': skill_num_array});
		}
	})
    
    $(".row.result-row").show();
    
    let monster_array = [...filter_set];
    
    $("#result-row").html(function()
    {
        var str = "";
        if(monster_array.length != 0)
        {
            // Block view
            
            str += `
                    <div class="col-12">
                        <div class="row result_block_view">
            `;
            $.each(monster_array, (index, monster) => {
                str += renderMonsterImage(monster);
            });
            str += `
                    </div>
                </div>
            `;
            
            
            // Row view
            
            str += `
                <div class="col-12">
                    <div class="row result_row_view">
                        <table class="table result_table">
            `;
            
            $.each(monster_array, (index, monster) => {
				const monster_obj = monster_data.find((element) => {
                    return element.id == monster.id;
                });
                const monster_attr = monster_obj?.attribute;
				const monster_name = monster_obj?.name ?? '';
				const error_path = `../tos_tool_data/img/monster/noname${monster_attr ? `_${attr_zh_to_en[monster_attr]}` : ''}.png`
                
                $.each(monster.nums, (num_index, skill_number) => {
					const monster_obj = monster_data.find((element) => {
                        return element.id == monster.id;
                    })
                    const skill = monster_obj.teamSkill[skill_number];
					const displayId = monster_obj?.displayId || monster_obj?.id
                    
                    if(num_index == 0)
                    {
                        str += `
                            <tr class="monster_first_tr monster_tr_${attr_zh_to_en[monster_attr]}">
                                <td class="td_monster_icon" rowspan=${monster.nums.length * 3}>
                                    <a href="https://tos.fandom.com/zh/wiki/${displayId}" target="_blank">
                                        <img class="monster_img" src="../tos_tool_data/img/monster/${monster.id}.png" title="${monster_name}" onerror="this.src='${error_path}'"></img>
                                        <div class="monsterId">${paddingZeros(displayId, 3)}</div>
                                    </a>
                                </td>`;
                    }
                    else {
                        str += `
                            <tr class="monster_tr monster_tr_${attr_zh_to_en[monster_attr]}">
                        `;
                    }
                    
                    str += `
                                <td class="td_description">
                                    ${descriptionTranslator(skill.description)}
                                </td>
                            </tr>
							<tr class="monster_tr_${attr_zh_to_en[monster_attr]}">
                                <td class="td_activate">
                                    ${descriptionTranslator(skill.activate)}
                                </td>
                            </tr>
                            <tr class="monster_tr_${attr_zh_to_en[monster_attr]}">
                                <td class="td_relative">
                    `
                    
					const relativeMonsters = new Set()
					$.each(skill.relative, (relative_index, relative_monster) => {
						if($.isNumeric(relative_monster) || relative_monster[0] == '?') {
							relativeMonsters.add(relative_monster)
						} else {
							const monsterWithTags = monster_data.filter((element) => {
								return element.monsterTag.includes(relative_monster);
							}).map(monster => monster.id)
							
							$.each(monsterWithTags, (monster_id, monster) => {
								relativeMonsters.add(monster)
							})
						}
					})
					
                    $.each([...relativeMonsters], (relative_index, relative_monster) => {
						const monster_obj = monster_data.find((element) => {
                            return element.id == relative_monster;
                        })
                        const monster_attr = monster_obj?.attribute;
						const monster_name = monster_obj?.name ?? '';
						const displayId = monster_obj?.displayId || monster_obj?.id
						const error_path = `../tos_tool_data/img/monster/noname${monster_attr ? `_${attr_zh_to_en[monster_attr]}` : ''}.png`
                        
                        str += `
                                    <img class="relative_img" src="../tos_tool_data/img/monster/${relative_monster}.png" title="No.${displayId} ${monster_name}" onerror="this.src='${error_path}'">
                                    </img>
                        `;
                    })
                    
                    str += `
                                </td>
                            </tr>
                    `;
                })
            });
            
                
            str += `
                            <tr class="monster_first_tr">
                                <td colspan=3></td>
                            </tr>
                
                        </table>
                    </div>
                </div>
            `;
        }
        else
        {
            str = `<div class='col-12' style="padding-top: 20px; text-align: center; color: #888888;"><h1>查無結果</h1></div>`;
        }
        return str;
    });
    
    $('.result').tooltip({ 
        boundary: 'scrollParent', 
        placement: 'auto', 
        container: 'body'
    });
    
    if(display_mode == 'row') $('.result_block_view').hide();
    else $('.result_row_view').hide();
    
    $(".search_tag").html(() => {
        let tag_html = "";
        
        tag_html += renderTags(skill_set, 'skill');
        tag_html += renderTags(keyword_set, 'keyword');
        tag_html += renderTags(activate_set, 'genre');
        tag_html += renderTags(attr_set, 'genre', '屬性');
        tag_html += renderTags(race_set, 'genre');
        tag_html += renderTags(star_set, 'genre', ' ★');
        
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

function renderMonsterImage(monster) {
	const monster_obj = monster_data.find((element) => {
        return element.id == monster.id;
    })
    const monster_attr = monster_obj.attribute;
	const displayId = monster_obj?.displayId || monster_obj?.id
	
	const error_path = `../tos_tool_data/img/monster/noname${monster_attr ? `_${attr_zh_to_en[monster_attr]}` : ''}.png`
    
    return `
        <div class='col-3 col-md-2 col-lg-1 result'>
            <img class='monster_img' style='cursor: default;' src='../tos_tool_data/img/monster/${monster.id}.png' onerror='this.src="${error_path}"'></img>
            <div class='monsterId'>
                <a href='https://tos.fandom.com/zh/wiki/${displayId}' target='_blank'>${paddingZeros(displayId, 3)}</a>
            </div>
        </div>
    `;
}

function descriptionTranslator(description) {
	return (description || '')
		?.replace(/\n[^\S\n]*/g, '<br>')
		?.replace(/^<br>/, '')
}

function hasActivateTag(activate_set, monster_skill) {
    let hasActivateTag = false
    $.each(monster_skill.activate_tag, (tag_index, tag) => {
        if(activate_set.has(tag)) {
            hasActivateTag = true;
            return false;
        }
    })
    
    return hasActivateTag;
}

function displaySwitch()
{
    $(`.result_${display_mode}_view`).hide();
    
    display_mode = display_mode == "block" ? "row" : "block"
    $(`#switch_display`).html(display_mode == "block" ? `<i class="fa fa-th-large"></i>` : `<i class="fa fa-list-ul"></i>`);
    $(`.result_${display_mode}_view`).show();
}
