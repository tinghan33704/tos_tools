const tool_id = 'active_skill';

let filter_set = new Set();
let filter_combine_set = new Set();
let option_obj = {};
let or_filter = 'or';
let or_filter_value = ['or', 'and', 'm-and'];
let sort_by = 'id';
let sort_by_method = [['id', '依編號排序'], ['charge', '依 CD/EP 排序'], ['attribute', '依屬性排序'], ['race', '依種族排序'], ['skill', '依功能排序']];
let theme = 'normal';
let searchResult = [];
let searchResultCharge = [];
let playerData = {uid: '', card: []}
let useInventory = false;
let resultCompressed = false;

let easterEggFlag = false;

const currentTimeObj = new Date()
const currentMonth = currentTimeObj.getMonth()
const currentDay = currentTimeObj.getDate()
const easterEggData = {
	"id": 595636351,
	"name": "蒼曜",
	"attribute": "光",
	"race": "人類",
	"star": 8,
	"monsterTag": [],
	"crossOver": false,
	"skill": [
		{
			"name": "毫無反應，就是個工程師",
			"type": "normal",
			"charge": "CD",
			"num": 1,
			"description": `I. 點擊頭像時<br>⇒ 「安安你好，我是作者」<br>⇒ 「不用去翻背包或圖鑑了，這不是卡片只是張名片」<br>II. 每週隨機時機<br>⇒ 更新資料庫${currentMonth == 4 && currentDay == 5 ? '<br>III. 今天我生日喔' : ''}<br><br>效果持續至退坑為止`,
			"tag": []
		},
	],
	"teamSkill": [],
	"maxLevel": 100,
	"maxSkill": 100,
	"maxRefine": 100,
	"version": "v4.5"
}

let settings = [
	{
		id: 'compress-btn',
		className: 'compressResult',
		content: "<i class='fa fa-expand'></i>",
		callback: 'compressResult()',
		description: '顯示查無結果',
		hideAfterClick: false,
	},
	{
		id: 'inventory-btn',
		className: 'inventory',
		content: "<i class='fa fa-archive'></i>",
		callback: 'openUidInputPanel()',
		description: '匯入/更新背包',
		hideAfterClick: true,
	},
	{
		id: 'option-btn',
		className: 'option',
		content: "<i class='fa fa-filter'></i>",
		callback: "openOptionPanel()",
		description: '進階篩選',
		hideAfterClick: true,
	},
	{
		id: 'changeTheme-btn',
		className: 'changeTheme',
		content: "<i class='fa fa-adjust'></i>",
		callback: 'changeTheme()',
		description: '淺色主題',
		hideAfterClick: false,
	}
]

$(document).ready(function() {
    init();
    
    location.search && readUrl();
});

function openOptionPanel()
{
	let hasSelectedSkill = false;
	$('.filter-row .filter').each(function() {
		if($(this).prop('checked'))
		{
			hasSelectedSkill = true;
			return false;
		}
	});
	if(hasSelectedSkill) {
		$('#optionPanel').modal('show');
		renderOptionPanel();
	}
	else errorAlert(2);
}

function renderOptionPanel() {
    let hasSelectedSkill = false;
    $(".filter-row .filter").each(function() {
        if($(this).prop('checked'))
        {
            if(!(Object.keys(option_obj).includes($(this).next("label").text())))
            {
                option_obj[$(this).next("label").text()] = Array(option_text.length).fill(false)
            }
            hasSelectedSkill = true
        }
        else 
        {
            if($(this).next("label").text() in option_obj)
            {
                delete option_obj[$(this).next("label").text()]
            }
        }
    });
    
    let render_str = ""
    let option_id = 0
    skill_type_string.forEach(function(row) {
        row.forEach(function(skill) {
            if(Object.keys(option_obj).includes(skill))
            {
				render_str += `
					<div class='row option-row'>
						<div class='col-12 col-md-12 col-lg-4 option-text'>${skill}</div>
				`
				
				if(!['多重左上狀態', '頭像狀態', '敵身狀態'].includes(skill)) {
					option_text.forEach((text, j) => {
						render_str += `
							<div class='col-12 col-md-4 col-lg-2 btn-shell'>
								<input type='checkbox' class='filter' id='option-${option_id * option_text.length + j}' ${option_obj[skill][j] ? 	'checked': ''}/>
								<label class='p-1 w-100 text-center option-btn' for='option-${option_id * option_text.length + j}'>
									${text}
								</label>
							</div>
						`
					})
				}
				render_str += `
						<hr>
					</div>
				`
                option_id ++
            }
        })
    })
    
    $("#optionPanel .modal-body").html(render_str)
}

function recordOption() {
    $("#optionPanel .option-row").each(function(){
        let option_text = $(this).find('.option-text').html()
        $(this).children('.btn-shell').each(function(i) {
            option_obj[option_text][i] = $(this).find('.filter').prop('checked')
        })
    })
}

function openUidInputPanel()
{
    $('#uidPanel').modal('show');
    renderUidInputPanel();
}

function renderUidInputPanel()
{
    let render_str = "";
	render_str += `
	<div class='row uid-row'>
		<div class='col-6 col-md-6 col-lg-6 uid-nav uid-nav-active' id='loadInventoryNav' onclick='switchGetInventory("load")'>匯入背包</div>
		<div class='col-6 col-md-6 col-lg-6 uid-nav' id='updateInventoryNav' onclick='switchGetInventory("update")'>更新背包</div>
		<div class='col-12 my-2'></div>
		
		<div class='col-12 col-md-12 col-lg-12 uid-tab' id='loadInventoryTab' style='display: block;'>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<input type='text' class='form-control uid-input' id='load-uid-input' placeholder='輸入 UID' maxlength=${uid_maxlength} onkeypress='return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))'>
			</div>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='load-confirm-uid' onclick='getPlayerInventory("load")'>
						確定
					</button>
				</div>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='load-save-inventory' onclick='savePlayerInventory("load")'>
						儲存背包
					</button>
				</div>
			</div>
			<div class='col-12 col-md-12 col-lg-12 uid-status' id='load-uid-status'></div>
		</div>
		
		<div class='col-12 col-md-12 col-lg-12 uid-tab' id='updateInventoryTab' style='display: none;'>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<input type='text' class='form-control uid-input' id='update-uid-input' placeholder='輸入 UID' maxlength=${uid_maxlength} onkeypress='return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))'>
			</div>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<input type='text' class='form-control uid-input' id='update-veri-input' placeholder='輸入驗證碼' maxlength=${veri_maxlength} onkeypress='return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))'>
			</div>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='update-confirm-uid' onclick='getPlayerInventory("update")'>
						確定
					</button>
				</div>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='update-save-inventory' onclick='savePlayerInventory("update")'>
						儲存背包
					</button>
				</div>
			</div>
			<div class='col-12 col-md-12 col-lg-12 uid-status' id='update-uid-status'></div>
		</div>
	</div>
	`

    $("#uidPanel .modal-body").html(render_str)
	$('#load-confirm-uid').css({'display': 'block'})
	$('#load-save-inventory').css({'display': 'none'})
	$('#update-confirm-uid').css({'display': 'block'})
	$('#update-save-inventory').css({'display': 'none'})
}

function switchGetInventory(state)
{
	if(state === 'load') {
		$("#loadInventoryNav").addClass('uid-nav-active')
		$("#updateInventoryNav").removeClass('uid-nav-active')
		
		$("#loadInventoryTab").css({'display': 'block'})
		$("#updateInventoryTab").css({'display': 'none'})
	}
	else {
		$("#loadInventoryNav").removeClass('uid-nav-active')
		$("#updateInventoryNav").addClass('uid-nav-active')
		
		$("#loadInventoryTab").css({'display': 'none'})
		$("#updateInventoryTab").css({'display': 'block'})
	}
	
	$('#load-uid-input').val('')
	$('#update-uid-input').val('')
	$('#update-veri-input').val('')
	$('#load-confirm-uid').css({'display': 'block'})
	$('#load-save-inventory').css({'display': 'none'})
	$('#update-confirm-uid').css({'display': 'block'})
	$('#update-save-inventory').css({'display': 'none'})
	$('#load-uid-status').html('')
	$('#update-uid-status').html('')
	$('#load-uid-input').attr('disabled', false)
	$('#update-uid-input').attr('disabled', false)
}

function startFilter()
{
    changeUrl();
    
    let skill_set = new Set();
    let attr_set = new Set();
    let race_set = new Set();
    let star_set = new Set();
    let charge_set = new Set();
    let tag_set = new Set();
    let genre_set = new Set();
    
    let filter_charge_set = new Set();
    
    let isSkillSelected = false;
    let isAttrSelected = false;
    let isRaceSelected = false;
    let isStarSelected = false;
    let isChargeSelected = false;
    let isTagSelected = false;
    let isGenreSelected = false;
	
	easterEggFlag = false;
    
    filter_set.clear();
    filter_combine_set.clear();
		
	[skill_set, isSkillSelected] = getSelectedButton('filter');
	[attr_set, isAttrSelected] = getSelectedButton('attr');
	[race_set, isRaceSelected] = getSelectedButton('race');
	[star_set, isStarSelected] = getSelectedButton('star', true);
	[charge_set, isChargeSelected] = getSelectedButton('charge');
	[tag_set, isTagSelected] = getSelectedButton('tag');
	[genre_set, isGenreSelected] = getSelectedButton('genre');
	
	let keyword_set = checkKeyword();
	
	let alias_skill_set = addAlias(skill_set, [...keyword_set])
	
	// easter egg :)
	if(!isSkillSelected && !isAttrSelected && !isRaceSelected && !isStarSelected && !isChargeSelected && !isTagSelected && keyword_set.size === 1 && [...keyword_set][0] === '蒼曜') easterEggFlag = true;
	
	$.each(monster_data, (index, monster) => {
		
		// if(useInventory && !playerData.card.includes(monster.id)) return;

		if( (!monster.star || monster.star <= 0) ||
			(isAttrSelected && !attr_set.has(monster.attribute)) || 
			(isRaceSelected && !race_set.has(monster.race)) || 
			(isStarSelected && !star_set.has(monster.star))) return;
			
		if(isTagSelected) {
			let hasTag = false;
			
			$.each(monster.monsterTag, (tag_index, tag) => {
				if(tag_set.has(tag)) {
					hasTag = true;
					return;
				}
			})
			
			if((tag_set.has('自家') && !monster.crossOver) || (tag_set.has('合作') && monster.crossOver)) hasTag = true;
			if(!hasTag) return;
		}
		
		if(isSkillSelected || keyword_set.size > 0) {
			let skill_num_array = [];
			let skill_num_array_combine = [];
			
			if(or_filter === 'm-and') {		// M-AND
				const all_skill_tags = monster.skill.reduce((acc, cur) => {
					return acc.concat(cur.tag)
				}, [])
				const all_skill_charge = monster.skill.map(skill => skill.charge)
				const all_skill_description = monster.skill.map(skill => skill.description)
				
				if(isChargeSelected && ![...charge_set].some(charge => all_skill_charge.includes(charge))) return;
				
				// Check for skill tags
				
				let isMonsterMatch = [...skill_set, ...alias_skill_set].every(selected_feat => {
					if(selected_feat in option_obj) {
						return all_skill_tags.some(tag => {
							return (tag === selected_feat || tag?.[0] === selected_feat) &&
									(
										(option_obj[selected_feat][0] && (!$.isArray(tag) || tag?.[1] === 1)) ||
										(option_obj[selected_feat][1] && tag?.[1] > 1) ||
										(option_obj[selected_feat][2] && tag?.[1] === -1) ||
										(!option_obj[selected_feat][0] && !option_obj[selected_feat][1] && !option_obj[selected_feat][2])
									)
						})
					} else {
						return all_skill_tags.some(tag => tag === selected_feat || tag?.[0] === selected_feat)
					}
				})
				
				if(!isMonsterMatch) return;
				
				// Check for keywords
				if(keyword_set.size > 0) {
					isMonsterMatch = [...keyword_set].every(keyword => {
						return all_skill_description.some(desc => textSanitizer(desc).includes(keyword))
					})
					
					if(!isMonsterMatch) return;
				}
				
				// All checks are done
				// Get index of included skill of the monster
				
				$.each([...monster.skill], (skill_index, monster_skill) => {
					let isMatch = false
					
					$.each([...skill_set, ...alias_skill_set], (selected_feat_index, selected_feat) => {
						if((selected_feat in option_obj && monster_skill.tag.some(tag => {
								return (tag === selected_feat || tag?.[0] === selected_feat) &&
										(
											(option_obj[selected_feat][0] && (!$.isArray(tag) || tag?.[1] === 1)) ||
											(option_obj[selected_feat][1] && tag?.[1] > 1) ||
											(option_obj[selected_feat][2] && tag?.[1] === -1) ||
											(!option_obj[selected_feat][0] && !option_obj[selected_feat][1] && !option_obj[selected_feat][2])
										)
							})) || 
							(!(selected_feat in option_obj) && monster_skill.tag.some(tag => tag === selected_feat || tag?.[0] === selected_feat))) 
						{
							let charge = ('reduce' in monster_skill) ? monster_skill.num - monster_skill.reduce : monster_skill.num;
							
							if(monster_skill.type === 'combine') skill_num_array_combine.push(skill_index);
							else skill_num_array.push(skill_index);
							
							filter_charge_set.add({'id': monster.id, 'num': skill_index, 'charge': charge})
							isMatch = true
							
							return false
						}
					})
					
					if(!isMatch && keyword_set.size > 0) {
						if([...keyword_set].some(keyword => textSanitizer(monster_skill.description).includes(keyword)))
						{
							let charge = ('reduce' in monster_skill) ? monster_skill.num - monster_skill.reduce : monster_skill.num;
							
							if(monster_skill.type === 'combine') skill_num_array_combine.push(skill_index);
							else skill_num_array.push(skill_index);
							
							filter_charge_set.add({'id': monster.id, 'num': skill_index, 'charge': charge})
						}
					}
				})
			} else {
				$.each([...monster.skill], (skill_index, monster_skill) => {
					if(isChargeSelected && !charge_set.has(monster_skill.charge)) return;
					
					if(or_filter === 'or')       // OR
					{
						// Check for skill tags
						let isSkillMatch = false;
						
						$.each([...skill_set, ...alias_skill_set], (skill_set_index, selected_feat) => {
							let isTagChecked = false;
							
							$.each(monster_skill.tag, (tag_index, tag) => {
								if($.isArray(tag))      // Tag with round mark
								{
									if(tag[0] == selected_feat) {
										if(selected_feat in option_obj)
										{
											if( (tag[1] == 1 && option_obj[selected_feat][0]) ||
												(tag[1] > 1  && option_obj[selected_feat][1]) ||
												(tag[1] == -1 && option_obj[selected_feat][2]) ||
												(!option_obj[selected_feat][0] && !option_obj[selected_feat][1] && !option_obj[selected_feat][2])
											) 
											{
												isTagChecked = true;
											}
										}
										else isTagChecked = true;
									}
								}
								else      // Tag without round mark
								{
									if(tag == selected_feat) {
										if(selected_feat in option_obj)
										{
											if( option_obj[selected_feat][0] ||
												(!option_obj[selected_feat][0] && !option_obj[selected_feat][1] && !option_obj[selected_feat][2])
											) 
											{
												isTagChecked = true;
											}
										}
										else isTagChecked = true;
									}
								}
								
								if(isTagChecked)
								{
									isSkillMatch = true;
									return false;
								}
							})
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
					else if(or_filter === 'and')     // AND
					{
						// Check for skill tags
						let isSkillMatch = true;
						
						$.each([...skill_set, ...alias_skill_set], (skill_set_index, selected_feat) => {
							let isTagChecked = false;
							$.each(monster_skill.tag, (tag_index, tag) => {
								if($.isArray(tag))
								{
									if(tag[0] == selected_feat) {
										if(selected_feat in option_obj)
										{
											if( (tag[1] == 1 && option_obj[selected_feat][0]) ||
												(tag[1] > 1  && option_obj[selected_feat][1]) ||
												(tag[1] == -1 && option_obj[selected_feat][2]) ||
												(!option_obj[selected_feat][0] && !option_obj[selected_feat][1] && !option_obj[selected_feat][2])
											) 
											{
												isTagChecked = true;
												return false;
											}
										}
										else
										{
											isTagChecked = true;
											return false;
										}
									}
								}
								else
								{
									if(tag == selected_feat) {
										if(selected_feat in option_obj)
										{
											if( option_obj[selected_feat][0] ||
												(!option_obj[selected_feat][0] && !option_obj[selected_feat][1] && !option_obj[selected_feat][2])
											) 
											{
												isTagChecked = true;
												return false;
											}
										}
										else
										{
											isTagChecked = true;
											return false;
										}
									}
								}
							})
								
							if(!isTagChecked)
							{
								isSkillMatch = false;
							}
						})
						
						if(!isSkillMatch) return;
						
						// Check for keywords
						if(keyword_set.size > 0) {
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
					}
					
					let charge = ('reduce' in monster_skill) ? monster_skill.num - monster_skill.reduce : monster_skill.num;
					
					if(monster_skill.type === 'combine') skill_num_array_combine.push(skill_index);
					else skill_num_array.push(skill_index);
					
					filter_charge_set.add({'id': monster.id, 'num': skill_index, 'charge': charge});
				})
			}
			
			if((!isGenreSelected || genre_set.has(genre_type_string[0])) && skill_num_array.length > 0) filter_set.add({'id': monster.id, 'attr': monster.attribute, 'race': monster.race, 'nums': skill_num_array});
			
			if((!isGenreSelected || genre_set.has(genre_type_string[1])) && skill_num_array_combine.length > 0) filter_combine_set.add({'id': monster.id, 'attr': monster.attribute, 'race': monster.race, 'nums': skill_num_array_combine, 'type': 'combine'});
		}
		else {
			let skill_num_array = [];
			let skill_num_array_combine = [];
			
			$.each(monster.skill, (skill_index, monster_skill) => {
				if(isChargeSelected && (!charge_set.has(monster_skill.charge) || monster_skill.name.length <= 0)) return;
				
				let charge = ('reduce' in monster_skill) ? monster_skill.num - monster_skill.reduce : monster_skill.num;
				
				if(monster_skill.type === 'combine') skill_num_array_combine.push(skill_index);
				else skill_num_array.push(skill_index);
				
				filter_charge_set.add({'id': monster.id, 'num': skill_index, 'charge': charge});
			})
			
			if((!isGenreSelected || genre_set.has(genre_type_string[0])) && skill_num_array.length > 0) filter_set.add({'id': monster.id, 'attr': monster.attribute, 'race': monster.race, 'nums': skill_num_array});
			
			if((!isGenreSelected || genre_set.has(genre_type_string[1])) && skill_num_array_combine.length > 0) filter_combine_set.add({'id': monster.id, 'attr': monster.attribute, 'race': monster.race, 'nums': skill_num_array_combine, 'type': 'combine'});
		}
	})
    
    $(".row.result-row").show();
    
	searchResult = [...filter_set, ...filter_combine_set];
    searchResultCharge = [...filter_charge_set];
	
	renderResult();
    
    $('.result').tooltip({ 
        boundary: 'scrollParent', 
        placement: 'auto', 
        container: 'body'
    });
    
    $(".search_tag").html(() => {
        let tag_html = "";
        
        $.each([...skill_set], (skill_index, skill) => {
                
			if(option_obj[skill]) {
				if( option_obj[skill].every(e => e === false) || 
					option_obj[skill].every(e => e === true)) {
					tag_html += renderTags([skill], 'skill');
				}
				else {
					$.each(option_obj[skill], (option_index, option) => {
						if(option) {
							tag_html += `
								<div class="col-12 col-sm-3 tag_wrapper">
									<div class="skill_tag" title="${skill} (${option_text[option_index]})">${skill} <font style="color: #CCCCFF; font-size: 0.8em;">(${option_text[option_index]})</font>
									</div>
								</div>
							`;
						}
					})
				}
			}
			else tag_html += renderTags([skill], 'skill');
		})
        
        tag_html += renderTags(tag_set, 'tag');
        tag_html += renderTags(keyword_set, 'keyword');
        tag_html += renderTags(attr_set, 'genre', '屬性');
        tag_html += renderTags(race_set, 'genre');
        tag_html += renderTags(star_set, 'genre', ' ★');
        tag_html += renderTags(charge_set, 'genre');
        tag_html += renderTags(genre_set, 'genre');
        
        return tag_html;
    });
	
	// Saitama easter egg :)
	setGlassBreak()
	
	// Attack on Titan easter egg :)
	chinarashiShake()
	
	// Jotaro and Dio easter egg :)
	setOraMuda()
	
    jumpTo("result_title");
}

function renderEasterEggResult() {
	const monster = {'id': easterEggData.id, 'attr': easterEggData.attribute, 'race': easterEggData.race, 'nums': [0]};
	
	$("#result-row").html(() => {
		let str = "";
		let sk_str = "";
				
		sk_str += renderMonsterInfo(monster, easterEggData);
		
		$.each(monster.nums, (num_index, skill_number) => {
			sk_str += renderSkillInfo(monster, skill_number, easterEggData);
		})
		
		str += renderMonsterImage(monster, sk_str, easterEggData, true);
		return str;
	});
	
    $('[data-toggle=popover]').popover({
		container: 'body',
		html: true,
		sanitize: false,
		trigger: 'focus',
		placement: 'bottom',
    })
    
	$("#uid-tag").text(`UID: ${playerData.uid}`)
}

function renderResult() {
	if(easterEggFlag) {
		renderEasterEggResult();
		return;
	}
	
	$("#result-row").html(() => {
		let tomoriEasterEgg = [...getSelectedButton('filter')[0]].includes('無視紅綠燈') ? "<div class='row' style='background-color: rgba(0, 0, 0, 0.15); margin: 0 15px;'><img src='../tos_tool_data/img/other/neglect_tomori.png' style='width: 50%; margin: auto; object-fit: contain;'/></div>" : ""
		
        if(sort_by == 'id')
        {
            /*searchResult.sort((a, b) => { 
                return a.id - b.id;
            });*/
            let str = "";
            
            if(searchResult.length != 0)
            {
                $.each(searchResult, (index, monster) => {
                    
                    let sk_str = "";
                    
					sk_str += renderMonsterInfo(monster);
					
					sk_str += renderAllSkillInfo(monster);
                    
					// for combine skill, create a new row
					if(index !== 0  && !('type' in searchResult[index-1]) && monster?.type === 'combine') str += '<hr class="result_combine_hr">'
                    
                    str += renderMonsterImage(monster, sk_str);
                });
            }
            else
            {
                str = `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h1>查無結果</h1></div>`;
            }
            return tomoriEasterEgg + str;
        }
        else if(sort_by == 'charge')
        {
            searchResultCharge.sort((a, b) => { 
                return a.charge - b.charge;
            });
            
            let str = "";
            let now_cd = 0;
            
            if(searchResultCharge.length != 0)
            {
                $.each(searchResultCharge, (index, monster) => {
                    
                    if(monster.charge != now_cd && monster.charge > 0)
                    {
                        now_cd = monster.charge;
                        str += `
                            <div class='col-sm-12'><hr class='charge_num_hr'></div>
                            <div class='col-sm-12 charge_num_div'>&nbsp;${now_cd}</div>
                        `;
                    }
                    
                    let sk_str = "";
                    
					sk_str += renderMonsterInfo(monster);
                    
					sk_str += renderAllSkillInfo(monster);
                    
                    str += renderMonsterImage(monster, sk_str);
                });
            }
            else
            {
                str = `<div class='col-sm-12' style="text-align: center; color: #888888;"><h1>查無結果</h1></div>`;
            }
            return tomoriEasterEgg + str;
        }
        else if(sort_by == 'attribute')
        {
            let attr_obj = {}
            $.each(attr_type_string, (attr_index, attr_str) => {
                attr_obj[attr_str] = [];
            })
            
            $.each(searchResult, (monster_index, monster) => {
                attr_obj[monster.attr].push(monster);
            })
            
            let str = "";
            
            if(searchResult.length != 0)
            {
                $.each(attr_obj, (attr_index, attr) => {
					
					let attr_str = `
                        <div class='col-sm-12'><hr class='charge_num_hr'></div>
                        <div class='col-sm-12 charge_num_div' style='color: ${attr_color[attr_index]};'>
                            <img src='../tos_tool_data/img/monster/icon_${attr_zh_to_en[attr_index]}.png' style='max-width: 30px;'\>
                            &nbsp;${attr_index}
                        </div>
                    `;
					
                    if(attr.length != 0) {
                        $.each(attr, (monster_index, monster) => {
                            let sk_str = "";
                    
							sk_str += renderMonsterInfo(monster);
                        
							sk_str += renderAllSkillInfo(monster);
							
							// for combine skill, create a new row
							if(monster_index !== 0  && !('type' in attr[monster_index-1]) && monster?.type === 'combine') attr_str += '<hr class="result_combine_hr">'
                            
                            attr_str += renderMonsterImage(monster, sk_str);
                        });
                    }
                    else attr_str += `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h2>查無結果</h2></div>`;
					
					if(attr.length != 0 || !resultCompressed) str += attr_str
                });
            }
            else
            {
                str = `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h1>查無結果</h1></div>`;
            }
            return tomoriEasterEgg + str;
        }
        else if(sort_by == 'race')
        {
            let race_obj = {}
            $.each(race_type_string, (race_index, race_str) => {
                race_obj[race_str] = [];
            })
            
            $.each(searchResult, (monster_index, monster) => {
                race_obj[monster.race].push(monster);
            })
            
            let str = "";
            
            if(searchResult.length != 0)
            {
                $.each(race_obj, (race_index, race) => {
					let race_str = `
                        <div class='col-sm-12'><hr class='charge_num_hr'></div>
                        <div class='col-sm-12 charge_num_div'>
                            <img src='../tos_tool_data/img/monster/icon_${race_zh_to_en[race_index]}.png' style='max-width: 30px;'\>
                            &nbsp;${race_index}
                        </div>
                    `;
                    
                    if(race.length != 0) {
                        $.each(race, (monster_index, monster) => {
                            let sk_str = "";
                    
							sk_str += renderMonsterInfo(monster);
							
							sk_str += renderAllSkillInfo(monster);
							
							// for combine skill, create a new row
							if(monster_index !== 0  && !('type' in race[monster_index-1]) && monster?.type === 'combine') race_str += '<hr class="result_combine_hr">'
                            
                            race_str += renderMonsterImage(monster, sk_str);
                        });
                    }
                    else race_str += `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h2>查無結果</h2></div>`;
					
					if(race.length != 0 || !resultCompressed) str += race_str
                });
            }
            else
            {
                str = `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h1>查無結果</h1></div>`;
            }
            return tomoriEasterEgg + str;
        }
        else if(sort_by == 'skill')
        {
            let skill_obj = {}
            $.each(skill_type_string, (skill_group_index, skill_group) => {
				$.each(skill_group, (skill_index, skill_str) => {
					skill_obj[skill_str] = []
				})
            })
			
            $.each(searchResult, (monster_index, monster) => {
				const skill_tags_array = monster_data.find(m => monster.id === m.id).skill.map(s => s.tag)
				$.each(monster.nums, (skill_index, skill) => {
					$.each(skill_tags_array[skill], (tag_index, tag) => {
						const tag_str = $.isArray(tag) ? tag[0] : tag
						
						if(!skill_obj?.[tag_str]) return;
						
						const isMonsterExist = monster?.type === 'combine' ? skill_obj[tag_str].some(m => monster.id === m.id && m?.type === 'combine') : skill_obj[tag_str].some(m => monster.id === m.id)
						if(isMonsterExist) {
							if(monster?.type === 'combine') skill_obj[tag_str].find(m => monster.id === m.id && m?.type === 'combine')?.nums.push(skill)
							else skill_obj[tag_str].find(m => monster.id === m.id)?.nums.push(skill)
						} else {
							skill_obj[tag_str].push({...monster, nums:[skill]})
						}
					})
				})
            })
            
            let str = "";
            
            if(searchResult.length != 0)
            {
                $.each(skill_obj, (skill_index, skill) => {
                    let skill_str = `
                        <div class='col-sm-12'><hr class='charge_num_hr'></div>
                        <div class='col-sm-12 charge_num_div'>
                            ${skill_index}
                        </div>
                    `;
                    
                    if(skill.length != 0) {
                        $.each(skill, (monster_index, monster) => {
                            let sk_str = "";
                    
							sk_str += renderMonsterInfo(monster);
							
							sk_str += renderAllSkillInfo(monster);
					
							// for combine skill, create a new row
							if(monster_index !== 0  && !('type' in skill[monster_index-1]) && monster?.type === 'combine') skill_str += '<hr class="result_combine_hr">'
                            
                            skill_str += renderMonsterImage(monster, sk_str);
                        });
                    }
                    else if(!resultCompressed) skill_str += `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h2>查無結果</h2></div>`;
					
					if(skill.length != 0 || !resultCompressed) str += skill_str
                });
            }
            else
            {
                str = `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h1>查無結果</h1></div>`;
            }
            return tomoriEasterEgg + str;
        }
    });
	
    $('[data-toggle=popover]').popover({
		container: 'body',
		html: true,
		sanitize: false,
		//trigger: 'click',
		trigger: 'focus',
		placement: 'bottom',
    })
	
	// Starburst easter egg :)
	
    $('[data-toggle=star-burst-popover]').popover({
		container: 'body',
		html: true,
		sanitize: false,
		trigger: 'focus',
		placement: 'bottom',
		template: '<div class="popover star-burst-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
    })
    
	$("#uid-tag").text(`UID: ${playerData.uid}`)
}

function renderMonsterInfo(monster, monsterObj) {
	const monster_info = monsterObj || monster_data.find((element) => {
		return element.id == monster.id;
	});
	
	return `
		<div class='row monster_info_header monster_info_header_${attr_zh_to_en[monster_info.attribute]}'>
			<div class='monster_attr_race_star col-12 col-sm-3'>
				<img src='../tos_tool_data/img/monster/icon_${attr_zh_to_en[monster_info.attribute]}.png' width='25px'/>
				<img src='${monster.id === 10444 ? `../tos_tool_data/img/other/icon_yao.png` : monster.id === 10495 ? `../tos_tool_data/img/other/icon_kirito.png` : `../tos_tool_data/img/monster/icon_${race_zh_to_en[monster_info.race]}.png`}' width='25px'/>
				<img src='../tos_tool_data/img/monster/icon_${monster_info.star}.png' width='25px'/>
			</div>
			<div class='skill_tooltip monster_name monster_name_${attr_zh_to_en[monster_info.attribute]} col-12 col-sm-9'>
				${monster_info.name}
			</div>
			<hr>
		</div>
	`
}

function renderAllSkillInfo(monster) {
	let sk_str = ''
	
	if('num' in monster) {
		sk_str += renderSkillInfo(monster, monster.num);
	} else {
		$.each(monster?.nums || [], (num_index, skill_number) => {
			sk_str += renderSkillInfo(monster, skill_number);
		})
	}
	
	return sk_str
}

function renderSkillInfo(monster, skill_number, monsterObj) {
	function renderMonsterImage(monsterObj) {
		const error_path = `../tos_tool_data/img/monster/noname${monsterObj?.attribute?.length ? `_${attr_zh_to_en[monsterObj.attribute]}` : ''}.png`
		return `<img src='../tos_tool_data/img/monster/${monsterObj.id}.png' onerror='this.src=&quot;${error_path}&quot;' title='${monsterObj.name}'\>`;
	}
	
    const monster_obj = monsterObj || monster_data.find((element) => {
        return element.id == monster.id;
    });
    const skill = monster_obj.skill[skill_number];
    const monster_attr = monster_obj.attribute;
    
    let sk_str = '';
    
    sk_str += `<div class='row monster-skill-name'>`;
    
    switch(skill.type) {
        case 'normal':
            sk_str += `<div class='skill_tooltip skill_name col-9 col-sm-9'>`;
        break;
        case 'refine':
            sk_str += `<div class='skill_tooltip skill_name_refine col-9 col-sm-9'><img src='../tos_tool_data/img/monster/refine_${skill.refine}.png' />&nbsp;`;
        break;
        case 'recall':
            sk_str += `<div class='skill_tooltip skill_name_recall col-9 col-sm-9'><img src='../tos_tool_data/img/monster/recall.png' />&nbsp;`;
        break;
        case 'combine':
            sk_str += `<div class='skill_tooltip skill_name_combine col-9 col-sm-9'><img src='../tos_tool_data/img/monster/combine.png' />&nbsp;`;
        break;
        default:
            sk_str += `<div class='skill_tooltip skill_name col-9 col-sm-9'>`;
    }
    sk_str += `${skill.name}</div>`
    
    let cd_str = 'reduce' in skill ? skill.num+" → "+(skill.num-skill.reduce) : skill.num <= 0 ? '-' : skill.num
    sk_str += `<div class='skill_tooltip skill_charge col-3 col-sm-3'>${skill.charge}&nbsp;${cd_str}</div>`
    
    sk_str += `</div>`;
    
    if('combine' in skill)
    {
        let combine_str = ''
        $.each(skill.combine.member, (combine_index, member) => {
			const combine_member_obj = monster_data.find((element) => {
				return element.id == member;
			});
            combine_str += `${renderMonsterImage(combine_member_obj)} ${combine_index !== skill.combine.member.length-1 ? ` + ` : ``}`;
        })
        
		const combine_out_obj = monster_data.find((element) => {
			return element.id == skill.combine.out;
		});
        combine_str += ` → ${renderMonsterImage(combine_out_obj)}`;
        
        sk_str += `
            <div class='row'>
                <div class='skill_tooltip col-sm-12'><hr></div>
            </div>
            <div class='row'>
                <div class='skill_tooltip skill_combine col-sm-12'>${combine_str}</div>
            </div>
        `;
    }
    
    if('transform' in skill)
    {
        let transform_str = ''
        transform_str += renderMonsterImage(monster_obj)
        
		if(!$.isArray(skill.transform)) {
			const transform_obj = monster_data.find((element) => {
				return element.id == skill.transform;
			});
			transform_str += ` → ${renderMonsterImage(transform_obj)}`;
        } else {
			transform_str += ` → ${skill.transform.map(target => {
				const transform_obj = monster_data.find((element) => {
					return element.id == target;
				});
				return renderMonsterImage(transform_obj)
			}).join('')}`;
			
		}
		
        sk_str += `
            <div class='row'>
                <div class='skill_tooltip col-sm-12'><hr></div>
            </div>
            <div class='row'>
                <div class='skill_tooltip skill_transform col-sm-12'>${transform_str}</div>
            </div>
        `;
    }
	
	
    if(skill.type === 'combine')
    {
        let combine_str = ''
        $.each(skill.member, (combine_index, member) => {
			const member_obj = monster_data.find((element) => {
				return element.id == member;
			});
            combine_str += `${renderMonsterImage(member_obj)} ${combine_index !== skill.member.length-1 ? ` + ` : ``}`;
        })
        
        sk_str += `
            <div class='row'>
                <div class='skill_tooltip col-sm-12'><hr></div>
            </div>
            <div class='row'>
                <div class='skill_tooltip skill_combine col-sm-12'>${combine_str}</div>
            </div>
        `;
    }
    
    sk_str += `
        <div class='row'>
            <div class='skill_tooltip col-sm-12'><hr></div>
        </div>
        <div class='row'>
            <div class='skill_tooltip skill_description col-sm-12'>${descriptionTranslator(monster.id, skill.description)}</div>
        </div>
    `;
    return sk_str;
}

function descriptionTranslator(monster_id, description) {
	return description
		.replace(/\n[^\S\n]*/g, '<br>')
		.replace(/^<br>/, '')
		.replace(/<board\s*(\d*)>(.*?)<\/board>/g, `<span class='fixed_board_label' onmouseover='showFixedBoard(${monster_id}, $1)' ontouchstart='showFixedBoard(${monster_id}, $1)'>$2</span>`)
		.replace(/<anno>(.*?)<\/anno>/g, `<font class='annotation_tag'>$1</font>`)
		.replace(/【階段 (\d*)】/g, `<font class='multiple_effect_tag'>【階段 $1】</font>`)
		.replace(/效果(\d+)：/g, `<font class='multiple_effect_tag'>效果$1：</font>`)
		.replace(/<meff>(.*?)<\/meff>/g, `<font class='multiple_effect_tag'>$1</font>`)
		.replace(/【連攜魔導式】/g, `<span class='desc_note_label' onmouseover='renderDescriptionNote(0)' ontouchstart='renderDescriptionNote(0)'>【連攜魔導式】</span>`)
		.replace(/亢奮(狀態)?/g, `<span class='desc_note_label positive_note_label' onmouseover='renderDescriptionNote(1)' ontouchstart='renderDescriptionNote(1)'>亢奮$1</span>`)
		.replace(/疲憊(狀態)?/g, `<span class='desc_note_label negative_note_label' onmouseover='renderDescriptionNote(2)' ontouchstart='renderDescriptionNote(2)'>疲憊$1</span>`)
		.replace(/暴擊(狀態)?/g, `<span class='desc_note_label positive_note_label' onmouseover='renderDescriptionNote(1)' ontouchstart='renderDescriptionNote(1)'>暴擊$1</span>`)
		.replace(/暴怒(狀態)?/g, `<span class='desc_note_label positive_note_label' onmouseover='renderDescriptionNote(3)' ontouchstart='renderDescriptionNote(3)'>暴怒$1</span>`)
		.replace(/神選(狀態)?/g, `<span class='desc_note_label positive_note_label' onmouseover='renderDescriptionNote(4)' ontouchstart='renderDescriptionNote(4)'>神選$1</span>`)
		.replace(/風壓(狀態)?/g, `<span class='desc_note_label negative_note_label' onmouseover='renderDescriptionNote(5)' ontouchstart='renderDescriptionNote(5)'>風壓$1</span>`)
		.replace(/休眠(狀態)?/g, `<span class='desc_note_label negative_note_label' onmouseover='renderDescriptionNote(6)' ontouchstart='renderDescriptionNote(6)'>休眠$1</span>`)
		.replace(/([痲麻])痺(狀態)?/g, `<span class='desc_note_label negative_note_label' onmouseover='renderDescriptionNote(7)' ontouchstart='renderDescriptionNote(7)'>$1痺$2</span>`)
		.replace(/沉默(狀態)?/g, `<span class='desc_note_label negative_note_label' onmouseover='renderDescriptionNote(8)' ontouchstart='renderDescriptionNote(8)'>沉默$1</span>`)
		.replace(/「道」狀態?/g, `<span class='desc_note_label positive_note_label' onmouseover='renderDescriptionNote(9)' ontouchstart='renderDescriptionNote(9)'>「道」狀態</span>`)
}

function showFixedBoard(id, subid) {
	const monster_obj = monster_data.find((element) => {
        return element.id === id;
    });
	const board_id = subid ? subid-1 : 0
	const board_data = $.isPlainObject(monster_obj.board[board_id]) ? monster_obj.board[board_id].board : monster_obj.board[board_id]
	
	renderFixedBoard(board_data, monster_obj.board[board_id]?.row, monster_obj.board[board_id]?.column, monster_obj.board[board_id]?.note)
}

function renderFixedBoard(data, row, column, note) {
	let board = ''
	const rowCount = row ?? 5
	const columnCount = column ?? 6
	for(let row = 0; row < rowCount; row++) {
		board += `<tr class='rune_tr'>`
		for(let col = 0; col < columnCount; col++) {
			const isNone = data[row * columnCount + col][0] === '-'
			const runeType = data[row * columnCount + col][0]
			const raceMark = data[row * columnCount + col][1]
			const isEnchanted = !/^\d+$/.test(runeType) && runeType === runeType.toUpperCase()
			const rune_img = `../tos_tool_data/img/rune/rune_${isNone ? 'none' : runeType.toLowerCase()}${(!isNone && isEnchanted) ? '_enc' : ''}.png`
			
			if(raceMark) {
				const race_img = `../tos_tool_data/img/rune/race_${raceMark}.png`
				board += `<td class='rune_td'><img class='rune_img' src=${rune_img} /><img class='race_img' src=${race_img} /></td>`
			}
			else {
				board += `<td class='rune_td'><img class='rune_img' src=${rune_img} /></td>`
			}
			
		}
		board += '</tr>'
	}
	
	let note_panel = ''
	if(note) {
		note_panel = note.map((str, index) => {
			const rune_img = `../tos_tool_data/img/rune/rune_${index + 1}.png`
			return `
			<div class='board_note'>
				<div class='board_note_row'>
					<img class='board_note_rune_img' src=${rune_img} />
					<div class='board_note_text'>
						${str}
					</div>
				</div>
			</div>`
		}).join('')
	}
	
	$("#fixedBoard").html(`
		<table class='board_table'>${board}</table>${note_panel}
	`).css({width: `${columnCount * 42 + 4}px`})
	
	$(document).on('mousemove', '.fixed_board_label', (e) => {
		$("#fixedBoard").css({
			left: e.pageX + 20,
			top: e.pageY - 100
		});
	}).on('touchstart', '.fixed_board_label', (e) => {
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		$("#fixedBoard").css({
			left: touch.pageX + 20,
			top: touch.pageY - 100
		});
	})
}

function renderDescriptionNote(desc_index) {
	switch(desc_index) {
		case 0:
			$("#descriptionNote").html('<span style="color:var(--text_desc_label_color);">場上有【連攜魔導式】技能生效時<br>⓵【連攜魔導式】類別技能<br>⇒ 不能發動<br>⓶ 改為可發動另一技能：<br>延長當前【連攜魔導式】 1 回合效果<br>⇒ 最多可延長至 6 回合</span>')
		break;
		case 1:
			$("#descriptionNote").html('<span style="color:var(--text_positive_label_color);">攻擊力 2 倍</span>')
		break;
		case 2:
			$("#descriptionNote").html('<span style="color:var(--text_negative_label_color);">攻擊力降為 0</span>')
		break;
		case 3:
			$("#descriptionNote").html('<span style="color:var(--text_positive_label_color);">攻擊力 5 倍</span>')
		break;
		case 4:
			$("#descriptionNote").html('<span style="color:var(--text_positive_label_color);">每有 1 個成員置身神選狀態，增加 5 連擊 (Combo)<br> (需消除符石)</span>')
		break;
		case 5:
			$("#descriptionNote").html('<span style="color:var(--text_negative_label_color);">陷入風壓狀態的角色：<br>⓵ 不能發動技能及攻擊<br>⓶ 不能發動角色符石</span>')
		break;
		case 6:
			$("#descriptionNote").html('<span style="color:var(--text_negative_label_color);">陷入休眠狀態的角色：<br>⓵ 無法使用技能<br>⓶ 攻擊力變 0</span>')
		break;
		case 7:
			$("#descriptionNote").html('<span style="color:var(--text_negative_label_color);">陷入痲痺狀態的角色：<br>⓵ 不能發動攻擊<br>⓶ 自身技能不會冷卻<br>⓷ 自身 EP 不會增加<br>⓸ 自身不受回技或回 EP 影響</span>')
		break;
		case 8:
			$("#descriptionNote").html('<span style="color:var(--text_negative_label_color);">⓵ 隊伍中有陷入沉默狀態的角色時不能發動龍刻脈動及龍刻技能<br>⓶ 陷入沉默狀態的角色無法使用技能</span>')
		break;
		case 9:
			$("#descriptionNote").html('<span style="color:var(--text_positive_label_color);">⓵ 自身攻擊力 1.5 倍<br>⓶ 無視人類、妖精類及神族敵人的防禦力<br>⓷ 自身以 50% 攻擊力追打自身原屬性攻擊 2 次</span>')
		break;
		default:
			$("#descriptionNote").html('');
	}
	
	$(document).on('mousemove', '.desc_note_label', (e) => {
		$("#descriptionNote").css({
			left: e.pageX + 20,
			top: e.pageY
		});
	}).on('touchstart', '.desc_note_label', (e) => {
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		$("#descriptionNote").css({
			left: touch.pageX + 20,
			top: touch.pageY
		});
	})
}

function renderMonsterImage(monster, tooltip_content, monsterObj, eggLink = false) {
    const monster_obj = monsterObj || monster_data.find((element) => {
        return element.id == monster.id;
    });
    const monster_attr = monster_obj.attribute;
    const hasSpecialImage = 'specialImage' in monster_obj && monster_obj.specialImage;
	const hasImageChange = 'num' in monster ? monster_obj.skill[monster.num]?.imageChange : monster?.nums?.length === 1 ? monster_obj.skill[monster.nums[0]]?.imageChange ?? null : null;
    const notInInventory = useInventory && !playerData.card.includes(monster.id)
	const isCombineSkill = monster_obj.skill[monster?.nums?.[0]]?.type === 'combine' || monster_obj.skill[monster?.num]?.type === 'combine';
	
	const digimonShinka = [10244, 10245, 10246, 10248, 10249, 10250].includes(monster.id) && checkKeyword().has('進化')
	const digimonChouShinka = [10244, 10245, 10246, 10248, 10249, 10250].includes(monster.id) && checkKeyword().has('超進化')
	const anyaSmile = monster.id === 10329 && searchResult?.find(monster => monster.id === 10335)
	const reinerSitDown = monster.id === 10400 && searchResult?.find(monster => monster.id === 10383 || monster.id === 10384)
	const sashaEat = [1873, 1874, 1875, 1876, 1877, 2251, 2252, 2253, 2254, 2255, 10308, 10422, 10449].includes(monster.id) && searchResult?.find(monster => monster.id === 10385)
	const cilantroAngry = monster.id === 2835 && searchResult?.find(monster => monster.id === 2023) && !searchResult?.find(monster => monster.id === 2149) && !searchResult?.find(monster => monster.id === 2335)
	const starburstBackground = monster.id === 10495 ? 'star-burst-popover' : 'popover'
	const congratClickListener = monster.id === 10495 ? `'congratCounter()'` : 'null'
	
	const currentTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
	const passedMinutesFromToday = currentTime.getHours() * 60 + currentTime.getMinutes()
	const isNowNight = monster.id === 10622 && (passedMinutesFromToday < 6 * 60 || passedMinutesFromToday >= 18 * 60)
	
	const src_path = digimonChouShinka ? `../tos_tool_data/img/monster/${monster_obj.id}_sp2.png` : digimonShinka ? `../tos_tool_data/img/monster/${monster_obj.id}_sp1.png` : anyaSmile ? `../tos_tool_data/img/monster/${monster_obj.id}_sp.png` : sashaEat ? `../tos_tool_data/img/monster/empty_${attr_zh_to_en[monster_obj.attribute]}.png` : cilantroAngry ? `../tos_tool_data/img/monster/${monster_obj.id}_sp.png` : isNowNight ? `../tos_tool_data/img/monster/${monster_obj.id}_sp.png` : `../tos_tool_data/img/monster/${hasImageChange ? hasImageChange[0] : monster_obj.id}.png`
	const error_path = `../tos_tool_data/img/monster/noname${monster_attr?.length ? `_${attr_zh_to_en[monster_attr]}` : ''}.png`
	const focus_path = hasImageChange ? `../tos_tool_data/img/monster/${hasImageChange[1]}.png` : hasSpecialImage ? `../tos_tool_data/img/monster/${monster_obj.id}_sp.png` : src_path
	const blur_path = hasImageChange ? `../tos_tool_data/img/monster/${hasImageChange[0]}.png` : src_path
	
	const fixedImgStyle = reinerSitDown ? "top: 20px; position: relative;" : ""
	const fixedIdTagStyle = reinerSitDown ? "position: relative;" : ""
	
    return `
        <div class='col-3 col-md-2 col-lg-1 result'>
            <img class='monster_img${notInInventory ? '_gray' : ''}' src='${src_path}' onerror='this.src="${error_path}"' onfocus='this.src="${focus_path}"' onblur='this.src="${blur_path}"' onclick=${congratClickListener} tabindex=${monster_obj.id.toString().replace('?', '')} data-toggle='${starburstBackground}' data-title='' data-content="${tooltip_content}" style='${fixedImgStyle}'></img>
			${isCombineSkill ? `<img class='monster_img_combine_icon${notInInventory ? '_gray' : ''}' src="../tos_tool_data/img/monster/combine.png" />` : ``}
			<!-- special image preload -->
			<img class='monster_img${notInInventory ? '_gray' : ''}' style="display: none;" src=${hasSpecialImage ? `../tos_tool_data/img/monster/${monster_obj.id}_sp.png` : ''}>
			<!-- -->
            <div class='monsterId${notInInventory ? '_gray' : ''}' style='${fixedIdTagStyle}'>
                <a href='${eggLink ? `https://home.gamer.com.tw/homeindex.php?owner=tinghan33704` : `https://tos.fandom.com/zh/wiki/${monster_obj.id}`}' target='_blank'>${paddingZeros(monster_obj.id, 3)}</a>
            </div>
        </div>
    `
}

function sortByChange()
{
    let sort_by_next_index = (sort_by_method.findIndex(element => element[0] === sort_by) + 1) % sort_by_method.length
    
    sort_by = sort_by_method[sort_by_next_index][0]
    $("#sort_by_result").text(sort_by_method[sort_by_next_index][1])
	
	renderResult()
	
    jumpTo("result_title");
}

function compressResult() {
	resultCompressed = !resultCompressed
	
	if(resultCompressed) {
		$("#compress-btn").html('<i class="fa fa-compress"></i>').addClass('resultCompressed-activate')
	} else {
		$("#compress-btn").html('<i class="fa fa-expand"></i>').removeClass('resultCompressed-activate')
	}
	renderResult()
	
	const _settingIndex = settings.findIndex(setting => setting.id === 'compress-btn')
	settings[_settingIndex] = {
		...settings[_settingIndex],
		content: `<i class="fa fa-${resultCompressed ? 'compress' : 'expand'}"></i>`,
		description: `${resultCompressed ? '隱藏' : '顯示'}查無結果`,
	}
	updateSetting(settings)
}

function changeOptionsUrl() {
	let opt_str = ''
	$(`.filter-row .filter`).each(function() {
        if($(this).prop('checked')) {
			const label = $(this).next("label").text()
			
			if(['多重左上狀態', '頭像狀態', '敵身狀態'].includes(label)) return
			
			opt_str += label in option_obj ? option_obj[label].reduce((acc, cur) => {
				return acc * 2 + (cur ? 1 : 0)
			}, 0).toString() : '0'
		}
    })
	
	return opt_str
}

function setOptionsFromUrl(skill, option) {
	option_obj = {}
	$(skill_type_string.flat()).each(function(index, item) {
		if(skill[index] === '1' && !['多重左上狀態', '頭像狀態', '敵身狀態'].includes(item)) {
			option_obj[item] = Array(option_text.length).fill(false)
		}
    })
	$(Object.keys(option_obj)).each(function(index, item) {
		let optionCode = +option[index] || 0
		const optionArr = option_obj[item].map(o => {
			const code = optionCode % 2
			optionCode = Math.trunc(optionCode / 2)
			return !!code
		})
		option_obj[item] = optionArr.reverse()
    })
}

function chinarashiShake() {
	function toggleClass() {
		$("#result-row div[class*='result']").toggleClass('shake');
		$("label[class*='-btn']").toggleClass('shake');
		$("div[class$='_tag']").toggleClass('shake');
		$("button").toggleClass('shake');
	}
	$("img[class^='monster_img'][src$='10402.png']").click(() => {
			toggleClass()
			setTimeout(() => toggleClass(), 500);
		}
	);
	
}

// Congratulations easter egg :)

let congratCount = 0;
let congratLock = false;
let congratTimer;

function congratCounter() {
	if(congratLock) return

	congratCount ++
	if(congratCount === 1) {
		startCongratTimer()
	} else if(congratCount >= 16) {
		showCongrat()
		congratLock = true
	}
}

function startCongratTimer() {
	congratTimer = setTimeout(checkComboCount, 10 * 1000)
}

function checkComboCount() {
	clearTimeout(congratTimer)
	if(congratCount < 16) {
		congratCount = 0
	}
}

function showCongrat() {
	clearTimeout(congratTimer)
	
	$('body').append(
	`
		<div class="congratBackground" style="position: fixed; top: 0; width: ${$(window).width()}px; height: ${$(window).height()}px; background-color: rgba(0, 0, 0, 0.75); opacity: 0; z-index: 100000;">
			<img class="congratImage" src='../tos_tool_data/img/other/congrat.png' style="position: absolute; width: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0; z-index: 100000; -webkit-user-select: none; -ms-user-select: none; user-select: none;" />
		</div>
	`)
	
	let fadeTime = 50;
	for(let i = 1; i <= fadeTime; i++) {
		setTimeout(function() {
			$('.congratBackground').css({'opacity': 1 / fadeTime * i})
		}, i * 10)
	}
	for(let i = 1; i <= fadeTime; i++) {
		setTimeout(function() {
			$('.congratImage').css({'opacity': 1 / fadeTime * i})
		}, 1000 + i * 10)
	}
	for(let i = 1; i <= fadeTime; i++) {
		setTimeout(function() {
			$('.congratBackground').css({'opacity': 1 - 1 / fadeTime * i})
			$('.congratImage').css({'opacity': 1 - 1 / fadeTime * i})
		}, 6000 + i * 10)
	}
	setTimeout(function() {
		congratLock = false
		congratCount = 0
		$('.congratBackground').remove()
	}, 6500)
	
}