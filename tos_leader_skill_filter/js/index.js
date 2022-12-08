const tool_id = 'leader_skill';

let filter_set = new Set();
let filter_combine_set = new Set();
let option_obj = {};
let option_attr_race_obj = {};
let option_object_obj = {};
let or_filter = true;
let theme = 'normal';
let searchResult = [];
let searchResultCharge = [];
let playerData = {uid: '', card: []}
let useInventory = false;


$(document).ready(function() {
    init();
	// checkDataLegality();
    location.search && readUrl();
});

function checkDataLegality() {
	const attr = attr_type_string.map(s => s[0])
	const race = race_type_string.map(s => s[0])
	const attr_race = []
	for(i of attr) {
		for(j of race) {
			attr_race.push(i+j)
		}
	}
	const obj_str = attr.concat(race).concat(attr_race).concat(leader_skill_object_string)
	const skill_str = leader_skill_type_string.flat()
	
	const invalid = leader_skill_data.filter(data => {
		return data.tag.length && data.tag.every(t => {
			return (Array.isArray(t.name) ? t.name.every(o => !skill_str.includes(o)) : !skill_str.includes(t.name)) 
			|| (t.limit.length && t.limit.every(o => !leader_skill_limit_string.includes(o))) 
			|| (t.object.length && t.object.every(o => !obj_str.includes(o)))
		})
	})
	console.log("Invalid team skill data:" + invalid)
	
	const allMonsterId = leader_skill_data.map(skill => skill?.monster).reduce((acc, cur) => acc.concat(cur) , [])
	monster_data.forEach(monster => {
		if(monster?.star > 0 && !allMonsterId.includes(monster?.id)) {
			console.log(monster?.id+':'+monster?.name)
		}
	})
}

function openOptionPanel()
{
    $('#optionPanel').modal('show');
    renderOptionPanel();
}

function renderOptionPanel() {
    let hasSelectedSkill = false;
    $(".filter-row .filter").each(function() {
        if($(this).prop('checked'))
        {
            if(!(Object.keys(option_obj).includes($(this).next("label").text())))
            {
                option_obj[$(this).next("label").text()] = Array(option_text.length).fill(false);
                option_attr_race_obj[$(this).next("label").text()] = Array(attr_type_string.length * race_type_string.slice(0, 7).length).fill(false);
				option_object_obj[$(this).next("label").text()] = Array(leader_skill_object_string.length).fill(false);
            }
            hasSelectedSkill = true;
        }
        else 
        {
            if($(this).next("label").text() in option_obj)
            {
                delete option_obj[$(this).next("label").text()];
                delete option_attr_race_obj[$(this).next("label").text()];
            }
        }
    });
    
    let render_str = "";
    let option_id = 0;
    leader_skill_type_string.forEach(function(row) {
        row.forEach(function(skill) {
            if(Object.keys(option_obj).includes(skill))
            {
				const applyToTeam = leader_skill_type_no_object.includes(skill)
				const attrRaceBoardOpen = !applyToTeam && (option_attr_race_obj?.[skill]?.some(ar => ar) || option_object_obj?.[skill]?.some(ob => ob))
				const limitBoardOpen = option_obj?.[skill]?.some(lim => lim)
                render_str += `
					<div class='row option-row'>
						<div class='col-12 col-md-12 col-lg-4 option-text'>${skill}</div>
						<div class='col-12 col-md-12 col-lg-8'>
							<div class='row'>
								${
									!applyToTeam ? `<div class='col-12 col-md-12 col-lg-12 option-title option-object-title'>
										<div class="row board-collapse-div" data-toggle="collapse" data-target=".board-collapse-${option_id}" aria-expanded=${attrRaceBoardOpen ? 'true' : 'false'}>
											<i class="fa fa-caret-down collapse-close" style="font-size: 1.2em; float: right;"></i>
											<i class="fa fa-caret-up collapse-open" style="font-size: 1.2em; float: right;"></i>
											作用對象
											<i class="fa fa-caret-down collapse-close" style="font-size: 1.2em; float: right;"></i>
											<i class="fa fa-caret-up collapse-open" style="font-size: 1.2em; float: right;"></i>
										</div>
									</div>` : ''
								}
								<div class='col-12 col-md-12 col-lg-12 option-board collapse board-collapse-${option_id}${attrRaceBoardOpen ? ' show' : ''}'>${renderAttributeRaceBoard(skill, option_id)}</div>
								<div class='col-12 col-md-12 col-lg-12 option-title option-limit-title'>
									<div class="row limit-collapse-div" data-toggle="collapse" data-target=".limit-collapse-${option_id}" aria-expanded=${limitBoardOpen ? 'true' : 'false'}>
										<i class="fa fa-caret-down collapse-close" style="font-size: 1.2em; float: right;"></i>
										<i class="fa fa-caret-up collapse-open" style="font-size: 1.2em; float: right;"></i>
										發動條件
										<i class="fa fa-caret-down collapse-close" style="font-size: 1.2em; float: right;"></i>
										<i class="fa fa-caret-up collapse-open" style="font-size: 1.2em; float: right;"></i>
									</div>
								</div>
								<div class='col-12 col-md-12 col-lg-12'>
									<div class='row option-limit collapse limit-collapse-${option_id}${limitBoardOpen ? ' show' : ''}'>
									${leader_skill_limit_string.map(function(text, j){
										const option_cnt = option_id * leader_skill_limit_string.length + j
										const id = `option-${option_cnt} ${option_obj[skill][j] ? 'checked': ''}`
										const label_obj = `option-${option_cnt}`
										return `
											<div class='col-12 col-md-4 col-lg-4 btn-shell'>
												<input type='checkbox' class='filter' id=${id}>
												<label class='p-1 w-100 text-center option-btn' for=${label_obj}>${text}</label>
											</div>`;
										}).join('')
									}
									</div>
								</div>
							</div>
						</div>
						<hr>
					</div>`
                option_id ++;
            }
        })
    })
    
    $("#optionPanel .modal-body").html(render_str)
}

function selectWholeRow(option_id, row) {
	for(let i = row * attr_type_string.length; i < (row + 1) * attr_type_string.length; i++) {
		const isChecked = $(`#option-attr-race-${option_id}-${i}`).attr('checked')
		$(`#option-attr-race-${option_id}-${i}`).attr('checked', !isChecked)
	}
}

function selectWholeColumn(option_id, col) {
	for(let i = col; i < 35; i += attr_type_string.length) {
		const isChecked = $(`#option-attr-race-${option_id}-${i}`).attr('checked')
		$(`#option-attr-race-${option_id}-${i}`).attr('checked', !isChecked)
	}
}

function renderAttributeRaceBoard(skill, option_id) {
	function renderButton(i, j) {
		const id = i * attr_type_string.length + j
		return `<div class='col-12 col-md-12 col-lg-12 btn-shell'>
					<input type='checkbox' class='filter' id='option-attr-race-${option_id}-${id}' ${option_attr_race_obj[skill][id] ? `checked`: ``}>
					<label class='p-1 w-100 text-center option-btn' for='${`option-attr-race-${option_id}-${id}`}'>&nbsp;</label>
				</div>`
	}
	
	return `
		<div class='row'>
			<div class='col-12'>
				<div class='row'>
					<div class='col-2'></div>
					${attr_type_string.map((attr, attr_id) => `
						<div class='col-2' onClick='selectWholeColumn(${option_id}, ${attr_id})' style='cursor: pointer;'>
							${attr}
						</div>
					`).join('')}
				</div>
			</div>
			<div class='col-12 attr-race-row'>
				${race_type_string.slice(0, 7).map((race, race_id) => `
					<div class='row'>
						<div class='col-2' onClick='selectWholeRow(${option_id}, ${race_id})' style='cursor: pointer;'>
							${race}
						</div>
						${[...Array(5).keys()].map(n => `
							<div class='col-2'>
								${renderButton(race_id, n)}
							</div>`
						).join('')}
					</div>`
				).join('')}
			</div>
			<div class='col-12 object-row'>
				<div class='row'>
				${leader_skill_object_string.map((obj, obj_id) => 
					`
					<div class='col-2'>${obj}</div>
					<div class='col-2'>
						<div class='col-12 col-md-12 col-lg-12 btn-shell'>
							<input type='checkbox' class='filter' id='option-obj-${option_id}-${obj_id}' ${option_object_obj[skill][obj_id] ? `checked`: ``}>
							<label class='p-1 w-100 text-center option-btn' for='${`option-obj-${option_id}-${obj_id}`}'>&nbsp;</label>
						</div>
					</div>`
				).join('')}
				</div>
			</div>
		</div>
	`
}

function recordOption() {
    $("#optionPanel .option-row").each(function(){
        let option_text = $(this).find('.option-text').html();
        $(this).find('.option-limit .btn-shell').each(function(i) {
            option_obj[option_text][i] = $(this).find('.filter').prop('checked');
        })
        $(this).find('.option-board .attr-race-row .btn-shell').each(function(i) {
            option_attr_race_obj[option_text][i] = $(this).find('.filter').prop('checked');
        })
        $(this).find('.option-board .object-row .btn-shell').each(function(i) {
            option_object_obj[option_text][i] = $(this).find('.filter').prop('checked');
        })
    });
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
    let tag_set = new Set();
    
    let isSkillSelected = false;
    let isAttrSelected = false;
    let isRaceSelected = false;
    let isStarSelected = false;
    let isTagSelected = false;
	
    filter_set.clear();
    filter_combine_set.clear();
		
	[skill_set, isSkillSelected] = getSelectedButton('filter');
	[attr_set, isAttrSelected] = getSelectedButton('attr');
	[race_set, isRaceSelected] = getSelectedButton('race');
	[star_set, isStarSelected] = getSelectedButton('star', true);
	[tag_set, isTagSelected] = getSelectedButton('tag');
	
	let keyword_set = checkKeyword();
	
	const option_attr_race_trans_obj = {}
	$.each(Object.keys(option_attr_race_obj), (index, skill) => {
		if(!leader_skill_type_no_object.includes(skill)) {
			option_attr_race_trans_obj[skill] = option_attr_race_obj[skill].map((selected, index) => {
				const attr = attr_type_string[index % attr_type_string.length]
				const race = race_type_string[Math.floor(index / attr_type_string.length)][0]
				return selected ? `${attr}${race}` : ''
			}).filter(str => str.length)
		}
	})
	$.each(Object.keys(option_object_obj), (index, skill) => {
		if(!leader_skill_type_no_object.includes(skill)) {
			if(option_attr_race_trans_obj[skill]) {
				option_attr_race_trans_obj[skill] = option_attr_race_trans_obj[skill].concat(option_object_obj[skill].map((selected, index) => {
					return selected ? leader_skill_object_string[index] : ''
				}).filter(str => str.length))
			} else {
				delete option_object_obj[skill]
			}
		}
	})
	
	const option_trans_obj = {}
	$.each(Object.keys(option_obj), (index, skill) => {
		option_trans_obj[skill] = option_obj[skill].map((selected, index) => {
			return selected ? leader_skill_limit_string[index] : ''
		}).filter(str => str.length)
	})
	
	$.each(leader_skill_data, (index, skill) => {
		
		const tag_arr = skill.tag || []
		const monster_arr = skill.monster || []
		
		if(isSkillSelected || keyword_set.size > 0)
		{
			if(or_filter)       // OR
			{
				let isSkillMatch = false;
				
				$.each([...skill_set], (skill_set_index, selected_feat) => {
					if(tag_arr.some(tag => tag.name === selected_feat || tag.name.includes(selected_feat))) {
						if(option_attr_race_trans_obj?.[selected_feat]?.length && option_trans_obj?.[selected_feat]?.length) {
							const feature_arr = tag_arr.filter(tag => tag.name === selected_feat || tag.name.includes(selected_feat))
							$.each(option_attr_race_trans_obj[selected_feat], (attr_race_index, attr_race) => {
								if((!leader_skill_object_string.includes(attr_race) && (feature_arr.some(feat => !feat.object.length || feat.object.includes(attr_race) || feat.object.includes(attr_race?.[0]) || feat.object.includes(attr_race?.[1]))))
								|| (leader_skill_object_string.includes(attr_race) && feature_arr.some(feat => feat.object.includes(attr_race)))) {
									const checking_items = feature_arr.filter(feat => feat.object.includes(attr_race) || feat.object.includes(attr_race?.[0]) || feat.object.includes(attr_race?.[1]))
									$.each(option_trans_obj[selected_feat], (limit_index, limit_option) => {
										if(checking_items.some(item => limit_option === '無' ? !item.limit.length : item.limit.includes(limit_option))) {
											isSkillMatch = true;
											return;
										}
									})
									if(isSkillMatch) return;
								}
							})
						} else if(option_attr_race_trans_obj?.[selected_feat]?.length) {
							const feature_arr = tag_arr.filter(tag => tag.name === selected_feat || tag.name.includes(selected_feat))
							$.each(option_attr_race_trans_obj[selected_feat], (attr_race_index, attr_race) => {
								if((!leader_skill_object_string.includes(attr_race) && (feature_arr.some(feat => !feat.object.length || feat.object.includes(attr_race) || feat.object.includes(attr_race?.[0]) || feat.object.includes(attr_race?.[1]))))
								|| (leader_skill_object_string.includes(attr_race) && feature_arr.some(feat => feat.object.includes(attr_race)))) {
									isSkillMatch = true;
									return;
								}
							})
						} else if(option_trans_obj?.[selected_feat]?.length) {
							const feature_arr = tag_arr.filter(tag => tag.name === selected_feat || tag.name.includes(selected_feat))
							$.each(option_trans_obj[selected_feat], (limit_index, limit_option) => {
								if(feature_arr.some(feat => limit_option === '無' ? !feat.limit.length : feat.limit.includes(limit_option))) {
									isSkillMatch = true;
									return;
								}
							})
						} else {
							isSkillMatch = true;
							return;
						}
					}
				})
				
				if(!isSkillMatch && keyword_set.size == 0) return;
				
				// Check for keywords
					
				if(!isSkillMatch && keyword_set.size > 0) {
					let isKeywordChecked = false;
					const skill_desc = textSanitizer(skill.description);
					
					$.each([...keyword_set], (keyword_index, keyword) => {
						if(skill_desc.includes(keyword))
						{
							isKeywordChecked = true;
							return false;
						}
					})
					
					if(!isKeywordChecked) return;
				}
				
				$.each(monster_arr, (monster_index, monster) => {
					const monster_obj = monster_data.find(m => m.id === monster)
					
					if(	(!monster_obj.star || monster_obj.star <= 0) ||
						(isAttrSelected && !attr_set.has(monster_obj.attribute)) || 
						(isRaceSelected && !race_set.has(monster_obj.race)) || 
						(isStarSelected && !star_set.has(monster_obj.star))) return;
						
					if(isTagSelected) {
						let hasTag = false;
						
						$.each(monster_obj.monsterTag, (tag_index, tag) => {
							if(tag_set.has(tag)) {
								hasTag = true;
								return;
							}
						})
						
						if((tag_set.has('自家') && !monster_obj.crossOver) || (tag_set.has('合作') && monster_obj.crossOver)) hasTag = true;
						if(!hasTag) return;
					}
						
					filter_set.add({'id': monster, 'name': skill.name, 'description': skill.description, 'changedSkill': skill?.changedSkill || false})
				})
			}
			else {       // AND
				let isSkillMatch = true;
				
				$.each([...skill_set], (skill_set_index, selected_feat) => {
					if(!tag_arr.some(tag => tag.name === selected_feat || tag.name.includes(selected_feat))) {
						isSkillMatch = false;
						return;
					} else {
						if(option_attr_race_trans_obj?.[selected_feat]?.length && option_trans_obj?.[selected_feat]?.length) {
							const feature_arr = tag_arr.filter(tag => tag.name === selected_feat || tag.name.includes(selected_feat))
							$.each(option_attr_race_trans_obj[selected_feat], (attr_race_index, attr_race) => {
								if((!leader_skill_object_string.includes(attr_race) && (feature_arr.some(feat => !feat.object.length || feat.object.includes(attr_race) || feat.object.includes(attr_race?.[0]) || feat.object.includes(attr_race?.[1]))))
								|| (leader_skill_object_string.includes(attr_race) && feature_arr.some(feat => feat.object.includes(attr_race)))) {
									const checking_items = feature_arr.filter(feat => feat.object.includes(attr_race) || feat.object.includes(attr_race?.[0]) || feat.object.includes(attr_race?.[1]))
									$.each(option_trans_obj[selected_feat], (limit_index, limit_option) => {
										if(!checking_items.some(item => item.limit.includes(limit_option))) {
											isSkillMatch = false;
											return;
										}
									})
									if(!isSkillMatch) return;
								}
							})
						} else if(option_attr_race_trans_obj?.[selected_feat]?.length) {
							const feature_arr = tag_arr.filter(tag => tag.name === selected_feat || tag.name.includes(selected_feat))
							$.each(option_attr_race_trans_obj[selected_feat], (attr_race_index, attr_race) => {
								if(!(!leader_skill_object_string.includes(attr_race) && (feature_arr.some(feat => !feat.object.length || feat.object.includes(attr_race) || feat.object.includes(attr_race?.[0]) || feat.object.includes(attr_race?.[1]))))
								|| (leader_skill_object_string.includes(attr_race) && feature_arr.some(feat => feat.object.includes(attr_race)))) {
									isSkillMatch = false;
									return;
								}
							})
						} else if(option_trans_obj?.[selected_feat]?.length) {
							const feature_arr = tag_arr.filter(tag => tag.name === selected_feat || tag.name.includes(selected_feat))
							$.each(option_trans_obj[selected_feat], (limit_index, limit_option) => {
								if(!feature_arr.some(feat => feat.limit.includes(limit_option))) {
									isSkillMatch = false;
									return;
								}
							})
						}
						
						if(!isSkillMatch) return;
					}
				})
				
				if(!isSkillMatch) return;
				
				// Check for keywords
					
				if(keyword_set.size > 0) {
					let isKeywordChecked = true;
					let skill_desc = textSanitizer(skill.description);
					
					$.each([...keyword_set], (keyword_index, keyword) => {
						if(!skill_desc.includes(keyword))
						{
							isKeywordChecked = false;
							return false;
						}
					})
					
					if(!isKeywordChecked) return;
				}
				
				$.each(monster_arr, (monster_index, monster) => {
					const monster_obj = monster_data.find(m => m.id === monster)
					
					if(	(!monster_obj.star || monster_obj.star <= 0) ||
						(isAttrSelected && !attr_set.has(monster_obj.attribute)) || 
						(isRaceSelected && !race_set.has(monster_obj.race)) || 
						(isStarSelected && !star_set.has(monster_obj.star))) return;
						
					if(isTagSelected) {
						let hasTag = false;
						
						$.each(monster_obj.monsterTag, (tag_index, tag) => {
							if(tag_set.has(tag)) {
								hasTag = true;
								return;
							}
						})
						
						if((tag_set.has('自家') && !monster_obj.crossOver) || (tag_set.has('合作') && monster_obj.crossOver)) hasTag = true;
						if(!hasTag) return;
					}
						
					filter_set.add({'id': monster, 'name': skill.name, 'description': skill.description, 'changedSkill': skill?.changedSkill || false})
				})
			}
		}
		else
		{
			$.each(monster_arr, (monster_index, monster) => {
				const monster_obj = monster_data.find(m => m.id === monster)
				
				if(	(!monster_obj.star || monster_obj.star <= 0) ||
					(isAttrSelected && !attr_set.has(monster_obj.attribute)) || 
					(isRaceSelected && !race_set.has(monster_obj.race)) || 
					(isStarSelected && !star_set.has(monster_obj.star))) return;
						
				if(isTagSelected) {
					let hasTag = false;
					
					$.each(monster_obj.monsterTag, (tag_index, tag) => {
						if(tag_set.has(tag)) {
							hasTag = true;
							return;
						}
					})
					
					if((tag_set.has('自家') && !monster_obj.crossOver) || (tag_set.has('合作') && monster_obj.crossOver)) hasTag = true;
					if(!hasTag) return;
				}
					
				filter_set.add({'id': monster, 'name': skill.name, 'description': skill.description, 'changedSkill': skill?.changedSkill || false})
			})
		}
	})
	
    
    $(".row.result-row").show();
    
	searchResult = [...filter_set].sort((a, b) => a.id - b.id);
	
	renderResult();
    
    $('.result').tooltip({ 
        boundary: 'scrollParent', 
        placement: 'auto', 
        container: 'body'
    });
    
    $(".search_tag").html(() => {
        let tag_html = "";
        
        $.each([...skill_set], (skill_index, skill) => {
			tag_html += renderTags([skill], 'skill');
		})
        
        tag_html += renderTags(tag_set, 'tag');
        tag_html += renderTags(keyword_set, 'keyword');
        tag_html += renderTags(attr_set, 'genre', '屬性');
        tag_html += renderTags(race_set, 'genre');
        tag_html += renderTags(star_set, 'genre', ' ★');
        
        return tag_html;
    });
	
    jumpTo("result_title");
}

function renderResult() {
	$("#result-row").html(() => {
        let str = "";
            
		if(searchResult.length != 0)
		{
			const leaderSkill = searchResult.filter(data => !data?.changedSkill)
			const changedLeaderSkill = searchResult.filter(data => data?.changedSkill)
			$.each(leaderSkill, (index, monster) => {
				
				let sk_str = "";
				
				sk_str += renderMonsterInfo(monster);
				
				sk_str += renderSkillInfo(monster);
				
				str += renderMonsterImage(monster, sk_str);
			});
			
			if(changedLeaderSkill.length) {
				
				// for changed leader skill, create a new row
				if(leaderSkill.length) {
					str += '<hr class="result_combine_hr">'
				}
				
				$.each(changedLeaderSkill, (index, monster) => {
					
					let sk_str = "";
					
					sk_str += renderMonsterInfo(monster);
					
					sk_str += renderSkillInfo(monster);
					
					str += renderMonsterImage(monster, sk_str);
				});
			}
				
				
		}
		else
		{
			str = `<div class='col-12' style='padding-top: 20px; text-align: center; color: #888888;'><h1>查無結果</h1></div>`;
		}
		return str;
    });
	
    $('[data-toggle=popover]').popover({
		container: 'body',
		html: true,
		sanitize: false,
		trigger: 'focus',
		placement: 'bottom',
    });
    
	$("#uid-tag").text(`UID: ${playerData.uid}`)
}

function renderMonsterInfo(monster, monsterObj) {
	const monster_info = monsterObj || monster_data.find((element) => {
		return element.id == monster.id;
	});
	
    let sk_str = '';
	
	sk_str += `<div class='row'>`

	sk_str += `<div class='col-6 col-sm-1 monster_attr'><img src='../tos_tool_data/img/monster/icon_${attr_zh_to_en[monster_info.attribute]}.png' width='25px'/></div>`;

	sk_str += `<div class='col-6 col-sm-1 monster_race'><img src='../tos_tool_data/img/monster/icon_${race_zh_to_en[monster_info.race]}.png' width='25px'/></div>`;

	sk_str += `<div class='skill_tooltip monster_name monster_name_${attr_zh_to_en[monster_info.attribute]} col-10 col-sm-10 mb-1'>${monster_info.name}</div>`;
	
	sk_str += `<hr></div>`
	
	return sk_str;
}

function renderSkillInfo(monster) {
    let sk_str = '';
    
    sk_str += `<div class='row'>`;
    
	if(monster?.changedSkill) {
		sk_str += `<div class='skill_tooltip skill_name_combine col-12 col-sm-12 mb-1'><img src='../tos_tool_data/img/monster/combine.png' />&nbsp;${monster.name}</div>`
    } else {
		sk_str += `<div class='skill_tooltip skill_name col-12 col-sm-12 mb-1'>${monster.name}</div>`;
	}
	
    sk_str += `</div>`;
    
    sk_str += `
        <div class='row'>
            <div class='skill_tooltip col-sm-12'><hr></div>
        </div>
        <div class='row'>
            <div class='skill_tooltip skill_description col-sm-12'>${monster.description}</div>
        </div>
    `;  

    return sk_str;
}

function renderMonsterImage(monster, tooltip_content, monsterObj) {
    const monster_obj = monsterObj || monster_data.find((element) => {
        return element.id == monster.id;
    });
    const monster_attr = monster_obj.attribute;
    const notInInventory = useInventory && !playerData.card.includes(monster.id)
	const isChangedLeaderSkill = monster?.changedSkill;
	
    return `
        <div class='col-3 col-md-2 col-lg-1 result'>
            <img class='monster_img${notInInventory ? '_gray' : ''}' src='../tos_tool_data/img/monster/${monster_obj.id}.png' onerror='this.src="../tos_tool_data/img/monster/noname_${attr_zh_to_en[monster_attr]}.png"'  tabindex=${monster_obj.id.toString().replace('?', '')} data-toggle='popover' data-title='' data-content="${tooltip_content}"></img>
			${isChangedLeaderSkill ? `<img class='monster_img_combine_icon${notInInventory ? '_gray' : ''}' src="../tos_tool_data/img/monster/combine.png" />` : ``}
            <div class='monsterId${notInInventory ? '_gray' : ''}'>
                <a href='${`https://tos.fandom.com/zh/wiki/${monster_obj.id}`}' target='_blank'>${paddingZeros(monster_obj.id, 3)}</a>
            </div>
        </div>
    `;
}