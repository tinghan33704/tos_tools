const tool_id = 'craft';

let filter_set = new Set();
let or_filter = 'or';
let or_filter_value = ['or', 'and'];
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
    let armed_set = new Set();
    let mode_set = new Set();
    let attr_set = new Set();
    let race_set = new Set();
    let star_set = new Set();
    let charge_set = new Set();
    let genre_set = new Set();
    
    let isSkillSelected = false;
    let isArmedSelected = false;
    let isModeSelected = false;
    let isAttrSelected = false;
    let isRaceSelected = false;
    let isStarSelected = false;
    let isChargeSelected = false;
    let isGenreSelected = false;
    
    filter_set.clear();
	let keyword_set = checkKeyword();

	[skill_set, isSkillSelected] = getSelectedButton('filter');
	[armed_set, isArmedSelected] = getSelectedButton('armed');
	[mode_set, isModeSelected] = getSelectedButton('mode');
	[attr_set, isAttrSelected] = getSelectedButton('attr');
	[race_set, isRaceSelected] = getSelectedButton('race');
	[star_set, isStarSelected] = getSelectedButton('star', true);
	[charge_set, isChargeSelected] = getSelectedButton('charge');
	[genre_set, isGenreSelected] = getSelectedButton('genre');
	
	// Normal craft
	
	if(!isGenreSelected || genre_set.has('一般龍刻')) {
		$.each(craft_data, (index, craft) => {
			if( (isModeSelected && !mode_set.has(craft.mode)) || 
				(isAttrSelected && !attr_set.has(craft.attribute)) || 
				(isRaceSelected && !race_set.has(craft.race)) || 
				(isStarSelected && !star_set.has(craft.star)) || 
				(isChargeSelected && !charge_set.has(craft.charge))) return;
				
			if(isSkillSelected || isArmedSelected || keyword_set.size > 0) {
				let skill_num_array = [];
				
				if(or_filter === 'or')       // OR
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
					// Normal craft do not have armed skill
					if(isArmedSelected) return;
					
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
	}
	
	// Armed craft
	
	if(!isGenreSelected || (genre_set.has('武裝龍刻') || genre_set.has('指定角色武裝') || genre_set.has('非指定角色武裝'))) {
		$.each(armed_craft_data, (index, craft) => {
			if( (isModeSelected && !mode_set.has(craft.mode)) || 
				(isAttrSelected && !(attr_set.has(craft?.attribute) || craft?.monster?.some(m => attr_set.has(monster_data.find(md => m === md.id)?.attribute)))) || 
				(isRaceSelected && !(race_set.has(craft.race) || craft?.monster?.some(m => race_set.has(monster_data.find(md => m === md.id)?.race)))) || 
				(isStarSelected && !star_set.has(craft.star)) || 
				(isChargeSelected && !charge_set.has(craft.charge)) ||
				(isGenreSelected && !genre_set.has('武裝龍刻') && ((genre_set.has('指定角色武裝') && !genre_set.has('非指定角色武裝') && !(craft?.monster || craft?.series)) || (genre_set.has('非指定角色武裝') && !genre_set.has('指定角色武裝') && (craft?.monster || craft?.series))))) return;
				
			if(isSkillSelected || isArmedSelected || keyword_set.size > 0) {
				let skill_num_array = [];
				
				if(or_filter === 'or')       // OR
				{
					// Check for skill tags
					let isSkillMatch = false;
					$.each([...skill_set], (skill_set_index, selected_feat) => {
						if(craft.skill_tag.includes(selected_feat)) {
							isSkillMatch = true;
							return false;
						}
					})
					if(!isSkillMatch) {
						$.each([...armed_set], (armed_set_index, selected_feat) => {
							if(craft.armed_tag.includes(selected_feat)) {
								isSkillMatch = true;
								return false;
							}
						})
					}
					
					if(!isSkillMatch && keyword_set.size == 0) return;
					
					// Check for keywords
					if(!isSkillMatch && keyword_set.size > 0) {
						let isKeywordChecked = false;
						
						$.each([...keyword_set], (keyword_index, keyword) => {
							$.each([...craft.skill_description, ...craft.armed_description], (desc_index, desc) => {
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
						if(!(craft.skill_tag.includes(selected_feat))) {
							isSkillMatch = false;
							return false;
						}
					})
					if(isSkillMatch) {
						$.each([...armed_set], (armed_set_index, selected_feat) => {
							if(!(craft.armed_tag.includes(selected_feat))) {
								isSkillMatch = false;
								return false;
							}
						})
					}
					
					if(!isSkillMatch) return;
					
					// Check for keywords
					let isAllKeywordChecked = true;
					$.each([...keyword_set], (keyword_index, keyword) => {
						let isKeywordChecked = false;
						$.each([...craft.skill_description, ...craft.armed_description], (desc_index, desc) => {
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
			(craft?.tag?.length > 0 || craft?.skill_tag?.length > 0 || craft?.armed_tag?.length > 0) && filter_set.add(craft.id);
		})
	}
    
    
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
        tag_html += renderTags(armed_set, 'skill2');
        tag_html += renderTags(keyword_set, 'keyword');
        tag_html += renderTags(mode_set, 'genre');
        tag_html += renderTags(attr_set, 'genre');
        tag_html += renderTags(race_set, 'genre');
        tag_html += renderTags(star_set, 'genre', ' ★');
        tag_html += renderTags(charge_set, 'genre');
        tag_html += renderTags(genre_set, 'genre');
        
        return tag_html;
    });
    
    $('[data-toggle=popover]').popover({
        container: 'body',
        html: true,
        trigger: 'focus',
        placement: 'bottom'
    })
    
    jumpTo("result_title");
}

function renderCraftInfo(craft_id) {
    let sk_str = "";
	let craft_info = craft_data?.find(craft => craft.id == craft_id) || armed_craft_data?.find(craft => craft.id == craft_id)
    let skill_arr = craft_info?.description || craft_info?.skill_description
    let armed_arr = craft_info?.armed_description
    
	sk_str += `
	<div class='skill_tooltip monster_name monster_name_${attr_zh_to_en[craft_info?.attribute]} col-12 col-sm-12'>${craft_info.name}</div>
	<hr class='skill_tooltip craft_skill_hr' />`
    
	let object_str = craft_info?.monster ? craft_info.monster.map(m => `<img class='skill_tooltip monster_img' src='../tos_tool_data/img/monster/${m}.png' title='${`No.${m} ${monster_data.find(monster => monster.id === m)?.name}`}' />`).join('') : craft_info?.series ? `擁有${craft_info?.series.map(s => `<span class='craft_object_series'>【${s}】</span>`).join('、')}特性` : (
		(craft_info?.attribute && craft_info?.attribute !== '沒有限制') ? `<img src='../tos_tool_data/img/monster/icon_${attr_zh_to_en[craft_info?.attribute]}.png' width='25' \>&nbsp;` : ''
	) + (
		(craft_info?.race && craft_info?.race !== '沒有限制') ? `<img src='../tos_tool_data/img/monster/icon_${race_zh_to_en[craft_info?.race]}.png' width='25' \>&nbsp;`: ''
	) + (
		(craft_info?.attribute && craft_info?.attribute !== '沒有限制') ? `${craft_info.attribute}屬性` : ''
	) + (
		(craft_info?.race && craft_info?.race !== '沒有限制') ? `${craft_info.race}`: ''
	)
	
	sk_str += `
	<div class='skill_tooltip craft_object row'>
		<div class='col-12 col-sm-4 craft_object_title'>
			${!object_str.length ? `裝備限制` : `適用對象`}
		</div>
		<div class='col-12 col-sm-8 craft_object_content monster_name_${craft_info?.attribute ? attr_zh_to_en[craft_info.attribute] : 'u'}'>
			${!object_str.length ? '無' : object_str}
		</div>
	</div><hr />`
	
	sk_str += `
	<div class='skill_tooltip craft_object row'>
		<div class='col-12 col-sm-4 craft_object_title'>
			充能條件
		</div>
		<div class='col-12 col-sm-8 craft_charge_content'>
			${craft_charge_type_string_mapping[craft_charge_type_string.indexOf(craft_info?.charge)] || ''}
		</div>
	</div>`
	
	if('add_hp' in craft_info && 'add_atk' in craft_info && 'add_rec' in craft_info) {
		sk_str += `
		<hr />
		<div class='skill_tooltip craft_enhance row'>
			<div class='col-12 col-sm-4'>
				<div class='row'>
					<div class='col-12 col-sm-12 craft_enhance_title craft_enhance_title_hp'>
						生命力
					</div>
					<div class='col-12 col-sm-12 craft_enhance_number'>
						+ ${craft_info?.add_hp === -1 ? '?' : craft_info?.add_hp} %
					</div>
				</div>
			</div>
			<div class='col-12 col-sm-4'>
				<div class='row'>
					<div class='col-12 col-sm-12 craft_enhance_title craft_enhance_title_atk'>
						攻擊力
					</div>
					<div class='col-12 col-sm-12 craft_enhance_number'>
						+ ${craft_info?.add_atk === -1 ? '?' : craft_info?.add_atk} %
					</div>
				</div>
			</div>
			<div class='col-12 col-sm-4'>
				<div class='row'>
					<div class='col-12 col-sm-12 craft_enhance_title craft_enhance_title_rec'>
						回復力
					</div>
					<div class='col-12 col-sm-12 craft_enhance_number'>
						+ ${craft_info?.add_rec === -1 ? '?' : craft_info?.add_rec} %
					</div>
				</div>
			</div>
		</div>`
	}
	
	sk_str += `
	<hr class='skill_tooltip craft_skill_hr' />
	`
	
	sk_str += `
	<div class='skill_tooltip craft_skill row'>
		<div class='col-12 col-sm-12 craft_skill_title'>
			龍脈能力
		</div>
		<div class='col-12 col-sm-12 craft_skills'>
	`
	
    $.each(skill_arr, (desc_index, desc) => {
        sk_str += `<hr style='margin: 5px 0;'>`;
    
        sk_str += `
            <div class='skill_tooltip skill_description'>
				<div class='col-2 col-sm-2'>
					<img src='../tos_tool_data/img/craft/skill_${desc_index + 1}.png' width='36px' />
				</div>
				<div class='col-10 col-sm-10'>
					${desc}
				</div>
            </div>
        `;
    });
	
	sk_str += `
		</div>
	</div>
	`
	
	if(armed_arr?.length > 0) {
		sk_str += `
		<hr class='skill_tooltip craft_skill_hr' />
		<div class='skill_tooltip craft_armed_skill row'>
			<div class='col-12 col-sm-12 craft_armed_skill_title'>
				武裝能力
			</div>
			<div class='col-12 col-sm-12 craft_armed_skills'>
		`
		
		$.each(armed_arr, (desc_index, desc) => {
			sk_str += `<hr style='margin: 5px 0;'>`;
		
			sk_str += `
				<div class='skill_tooltip skill_description'>
					<div class='col-2 col-sm-2'>
						<img src='../tos_tool_data/img/craft/armed_skill_${desc_index + 1}.png' width='36px' />
					</div>
					<div class='col-10 col-sm-10'>
						${desc}
					</div>
				</div>
			`;
		});
		
		sk_str += `
			</div>
		</div>
		`
	}
	
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
