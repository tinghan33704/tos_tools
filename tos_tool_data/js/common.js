
$(window).resize(() => {
    $('.side_navigation').css(
        {
            top: (parseInt($('#top-bar').css('height'))-20)+'px'
        }
    );
});

function init() {
    $(".row.result-row").hide();
	
	setNotification();
    
    $('#toTop-btn').click(() => { 
        $('html,body').animate({
            scrollTop: 0
        }, 300);
    });
    
    $('#toBottom-btn').click(() => { 
        $('html,body').animate({
            scrollTop: $(document).height() - $(window).height()
        }, 300);
    });
    
    $(window).scroll(() => {
        if ($(this).scrollTop() > 300) $('#toTop-btn').fadeIn(200);
        else $('#toTop-btn').stop().fadeOut(200);
        if ($(this).scrollTop() < $(document).height() - $(this).height() - 300) $('#toBottom-btn').fadeIn(200);
        else $('#toBottom-btn').stop().fadeOut(200);
    }).scroll();
	
	$('#toBottom-btn').fadeIn(200);
	
	/*$(window).click((e) => {
		if(!$(e.target).hasClass('skill_tooltip') && !$(e.target).hasClass('monster_img')) {
			$('[data-toggle=popover]').popover('hide')
		}
    });*/
	
	$(window).click((e) => {
		if(!(e.target).closest('.setting') && !(e.target).closest('.setting-row')) {
			hideSetting()
		}
    })
	
	$(document).on('mouseenter', '.fixed_board_label', () => {
		$("#fixedBoard").css('display', 'block')
	}).on('touchstart', '.fixed_board_label', () => {
		$("#fixedBoard").css('display', 'block')
	}).on('mouseleave', '.fixed_board_label', () => {
		$("#fixedBoard").css('display', 'none')
	}).on('touchend', '.fixed_board_label', () => {
		$("#fixedBoard").css('display', 'none')
	}).on('blur', '.monster_img', () => {
		$("#fixedBoard").css('display', 'none')
	}).on('touchleave touchcancel', '.monster_img', () => {
		$("#fixedBoard").css('display', 'none')
	});
	
	$(document).on('mouseenter', '.desc_note_label', () => {
		$("#descriptionNote").css('display', 'block')
	}).on('touchstart', '.desc_note_label', () => {
		$("#descriptionNote").css('display', 'block')
	}).on('mouseleave', '.desc_note_label', () => {
		$("#descriptionNote").css('display', 'none')
	}).on('touchend', '.desc_note_label', () => {
		$("#descriptionNote").css('display', 'none')
	}).on('blur', '.monster_img', () => {
		$("#descriptionNote").css('display', 'none')
	}).on('touchleave touchcancel', '.monster_img', () => {
		$("#descriptionNote").css('display', 'none')
	});
    
    $('.side_navigation').html(() => {
        return createSideNavigation();
    })
    $('.side_navigation').css(
        {
            top: (parseInt($('#top-bar').css('height'))-20)+'px'
        }
    );
    
    switch(tool_id) {
        case 'active_skill':
            createFilterButtonRow("filter", skill_type_string);
            createKeywordRow();
            createFilterButtonRow("tag", tag_string);
            createFilterButtonRow("attr", attr_type_string);
            createFilterButtonRow("race", race_type_string);
            createFilterButtonRow("star", star_type_string, ' ★');
            createFilterButtonRow("charge", charge_type_string);
            createFilterButtonRow("genre", genre_type_string);
			or_filter = or_filter_value?.[0];
        break;
        case 'team_skill':
            createFilterButtonRow("filter", team_skill_type_string);
            createKeywordRow();
            createFilterButtonRow("activate", team_skill_activate_string);
            createFilterButtonRow("attr", attr_type_string);
            createFilterButtonRow("race", race_type_string);
            createFilterButtonRow("star", star_type_string, ' ★');
			or_filter = or_filter_value?.[0];
        break;
        case 'leader_skill':
            createFilterButtonRow("filter", leader_skill_type_string);
            createKeywordRow();
            createFilterButtonRow("tag", tag_string);
            createFilterButtonRow("activate", team_skill_activate_string);
            createFilterButtonRow("attr", attr_type_string);
            createFilterButtonRow("race", race_type_string);
            createFilterButtonRow("star", star_type_string, ' ★');
			or_filter = or_filter_value?.[0];
        break;
        case 'craft':
            createFilterButtonRow("filter", craft_skill_type_string);
            createFilterButtonRow("armed", craft_armed_type_string);
            createKeywordRow();
            createFilterButtonRow("mode", craft_mode_type_string);
            createFilterButtonRow("attr", craft_attr_type_string);
            createFilterButtonRow("race", craft_race_type_string);
            createFilterButtonRow("star", craft_star_type_string, ' ★');
            createFilterButtonRow("charge", craft_charge_type_string);
            createFilterButtonRow("genre", craft_genre_type_string);
			or_filter = or_filter_value?.[0];
        break;
    }
	
	/*$(".btn-shell label").each((index, ele) => {
		const svg = $(ele).find("svg")[0];
		const text = $(svg).find("text")[0];
		
		const divWidth = ele.getBoundingClientRect().width;
		$(svg).attr('viewBox', `0 0 ${divWidth} 30`)
		
		const textLength = text ? text.getComputedTextLength() : 0;
		console.log(divWidth, textLength)
		if(textLength < divWidth) {
			$(svg).attr('viewBox', `0 0 ${Math.ceil(textLength).toString()} 30`)
		}
	})*/
    
    keyword_search = false;

    $(".copyright").length && $(".copyright").html(() =>  {
        const currYear = new Date().getFullYear()
		const startYear = tool_id === 'active_skill' || tool_id === 'craft' ? '2019' : 
						  tool_id === 'team_skill' ? '2020' : 
						  tool_id === 'backpack' || tool_id === 'id_selector' ? '2021' : 
						  tool_id === 'monster_selector' || tool_id === 'leader_skill' ? '2022' : ''
        return `
			<div class='author_info'>
				<div>Copyright © ${startYear}-${currYear} 蒼曜(tinghan33704)</div>
				<div class='author_link'>
					<a target='_blank' href='https://www.facebook.com/profile.php?id=100070781094266'><img src='../tos_tool_data/img/other/fb_icon.png' /></a>
					<a target='_blank' href='https://home.gamer.com.tw/profile/index.php?&owner=tinghan33704'><img src='../tos_tool_data/img/other/bahamut_icon.png' /></a>
					<a target='_blank' href='https://github.com/tinghan33704'><img src='../tos_tool_data/img/other/github_icon.png' /></a>
				</div>
			</div>`
    });
    
    $("#start_filter").length && $("#start_filter").on("click", startFilter);
    $("#and_or_filter").length && $("#and_or_filter").on("click", andOrChange);
    $("#sort_by_result").length && $("#sort_by_result").on("click", sortByChange);
    $("#reset_all").length && $("#reset_all").on("click", clearAll);
    $("#reset_skill").length && $("#reset_skill").on("click", clearFilterButtonRow('filter'));
    $("#reset_activate").length && $("#reset_activate").on("click", clearFilterButtonRow('activate'));
    $("#reset_attr").length && $("#reset_attr").on("click", clearFilterButtonRow('attr'));
    $("#reset_race").length && $("#reset_race").on("click", clearFilterButtonRow('race'));
    $("#reset_star").length && $("#reset_star").on("click", clearFilterButtonRow('star'));
    $("#reset_charge").length && $("#reset_charge").on("click", clearFilterButtonRow('charge'));
    $("#reset_genre").length && $("#reset_genre").on("click", clearFilterButtonRow('genre'));
    $("#reset_tag").length && $("#reset_tag").on("click", clearFilterButtonRow('tag'));
    $("#reset_mode").length && $("#reset_mode").on("click", clearFilterButtonRow('mode'));
    $("#reset_armed").length && $("#reset_armed").on("click", clearFilterButtonRow('armed'));
    $("#reset_keyword").length && $("#reset_keyword").on("click", clearKeyword);
    $("#optionPanel").length && $('#optionPanel').on('hide.bs.modal', recordOption);
    $("#switch_display").length && $('#switch_display').on("click", displaySwitch);
    $("#close_notification").length && $('#close_notification').on("click", closeNotification);
    $("#use-inventory").length && $('#use-inventory').on("click", inventorySwitch);
    
	playerData = localStorage.getItem('PLAYER_DATA') ? JSON.parse(localStorage.getItem('PLAYER_DATA')) : {uid: '', card: [], lastUpdated: null, wholeData: []}
	$("#uid-tag").text(`UID: ${playerData.uid}`)
	setUpdateBanner()
	
	theme = localStorage.getItem('TOOL_THEME') || 'normal'
	setTheme(theme)
	
	pressChangeThemeTime = 0;
	
	$(document.body).append(`
		<button type="button" id="setting-btn" class="setting" onclick="toggleSetting()">
			<i class="fa fa-cog setting-icon"></i>
		</button>
		<div class="setting-panel">
			${renderSettings(settings)}
		</div>
	`)
	
	// preload glass break image
	const glass_break_img = new Image()
    glass_break_img.src = '../tos_tool_data/img/other/glass_break.png'
	
	if(tool_id === 'active_skill') {
		// preload yao icon image
		const yao_icon_img = new Image()
		yao_icon_img.src = '../tos_tool_data/img/other/icon_yao.png'
		
		// preload kirito icon image
		const kirito_icon_img = new Image()
		kirito_icon_img.src = '../tos_tool_data/img/other/icon_kirito.png'
		
		// preload starburst gif
		const starburst_gif = new Image()
		starburst_gif.src = '../tos_tool_data/img/other/starburst.gif'
		
		// preload tadokoro icon image
		const tadokoro_icon_img = new Image()
		tadokoro_icon_img.src = '../tos_tool_data/img/other/icon_tadokoro.png'
		
	}
}

function setNotification() {
	switch(tool_id) {
        case 'active_skill':
			if(active_skill_notification.length) {
				$("#notification_text").html(active_skill_notification)
				$("#notification").css({'display': 'block'})
			}
        break;
        case 'team_skill':
			if(team_skill_notification.length) {
				$("#notification_text").html(team_skill_notification)
				$("#notification").css({'display': 'block'})
			}
        break;
        case 'leader_skill':
			if(team_skill_notification.length) {
				$("#notification_text").html(leader_skill_notification)
				$("#notification").css({'display': 'block'})
			}
        break;
        case 'craft':
			if(craft_notification.length) {
				$("#notification_text").html(craft_notification)
				$("#notification").css({'display': 'block'})
			}
        break;
        case 'backpack':
			if(backpack_notification.length) {
				$("#notification_text").html(backpack_notification)
				$("#notification").css({'display': 'block'})
			}
        break;
    }
	
}

function closeNotification() {
	$("#notification").css({'display': 'none'})
}

function createSideNavigation() {
    return `
        <a ${tool_id === 'active_skill' ? `href="#"` : `target="_blank" href="../tos_skill_filter/tos_skill_filter.html"` }>主動技搜尋器</a>
        <a ${tool_id === 'team_skill' ? `href="#"` : `target="_blank" href="../tos_team_skill_filter/tos_team_skill_filter.html"` }>隊伍技搜尋器</a>
		<a ${tool_id === 'leader_skill' ? `href="#"` : `target="_blank" href="../tos_leader_skill_filter/tos_leader_skill_filter.html"` }>隊長技搜尋器</a>
        <a ${tool_id === 'craft' ? `href="#"` : `target="_blank" href="../tos_craft_filter/tos_craft_filter.html"` }>龍刻搜尋器</a>
		<a ${tool_id === 'backpack' ? `href="#"` : `target="_blank" href="../tos_backpack_viewer/tos_backpack_viewer.html"` }>背包檢視器</a>
		<hr />
		<a ${tool_id === 'monster_selector' ? `href="#"` : `target="_blank" href="../tos_monster_selector/tos_monster_selector.html"` }>召喚獸編號生成器</a>
		<a ${tool_id === 'id_selector' ? `href="#"` : `target="_blank" href="../tos_id_selector/tos_id_selector.html"` }>龍刻編號生成器</a>
    `
}

function createFilterButtonRow(name, data, postAppend = '') {
    $(`.${name}-row`).html(() =>
    {
        let str = $(`.${name}-row`).html();
        
        if(!$.isArray(data[0])) {
            $.each(data, (index, item) => {
				const iconImg = item === '沒有限制' ? '' : name === 'attr' ? `<img src='../tos_tool_data/img/monster/icon_${attr_zh_to_en[item]}.png'>&nbsp;&nbsp;` : name === 'race' ? `<img src='../tos_tool_data/img/monster/icon_${race_zh_to_en[item]}.png'>&nbsp;&nbsp;` : ''
                
				const itemKey = stringToUnicode(`${item}${postAppend}`)
				
				str += 
                `<div class='col-6 col-md-4 col-lg-2 btn-shell' title='${item}${postAppend}'>
                    <input type='checkbox' class='filter' id='${name}-${index}' />
                    <label class='p-1 w-100 text-center ${name}-btn' for='${name}-${index}' key='${itemKey}'>${iconImg}${item}${postAppend}</label>
                </div>`;
            })
        }
        else {
            $.each(data, (index_group, group) => {
                str += index_group !== 0 ? `<div class='col-12 my-2'></div>` : ``
				
                $.each(group, (index, item) => {
					const itemKey = stringToUnicode(`${item}${postAppend}`)
					
                    str += 
                    `<div class='col-6 col-md-4 col-lg-2 btn-shell' title='${item}${postAppend}'>
                        <input type='checkbox' class='filter' id='${name}-${index_group}-${index}' />
                        <label class='p-1 w-100 text-center ${name}-btn' for='${name}-${index_group}-${index}' key='${itemKey}'>${item}${postAppend}</label>
                    </div>`;
                })
            })
        }
		
		/* 	Possible SVG solution for automatic font sizing
		<svg width="100" height="30" viewBox="0 0 100 30"'>
			<text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle">${skill}${postAppend}</text>
		</svg>
		*/
        
        return str;
    });
}

function createKeywordRow() {
    $(".keyword-row").html(() => {
        let str = $(".keyword-row").html();
        str += `
        <div class='col-12 btn-shell'>
            <input type='text' class='form-control keyword-input' id='keyword-input' placeholder='輸入技能關鍵字' maxlength=${input_maxlength}>
        </div>`;
        return str;
    });
}

function clearFilterButtonRow(name) {
    return function() {
        $(`.${name}-row .filter`).prop('checked', false);
        filter_set.clear();
    }
}

function checkKeyword() {
    /* keyword input check */
    let keyword_group = textSanitizer($('#keyword-input').val());
        
    if(keyword_group.length > input_maxlength)
    {
        errorAlert(4);
        return;
    }
    
    /* keyword input split */
    let keyword_set = new Set();
    
    keyword_set.clear();
    
    let keywords = keyword_group.split(',');
    $.each(keywords, (index, keyword) => {
        if(keyword.length > 0 && keyword.length <= input_maxlength) keyword_set.add(keyword);
    });
    
    return keyword_set;
}

function addAlias(skill_set, keywords) {
	let new_skill_set = new Set(JSON.parse(JSON.stringify([...skill_set])))
	$.each(Object.keys(skill_alias), (index, skill) => {
		const keyword_alias_arr = skill_alias[skill]
		$.each(keywords, (kindex, keyword) => {
			if(keyword_alias_arr.includes(keyword)) {
				new_skill_set.add(skill)
				return false
			}
		})
	})
	
	return new_skill_set
}

function clearKeyword()
{
    $("#keyword-input").val('');
}

function clearAll()
{
    clearFilterButtonRow('filter')();
    clearFilterButtonRow('attr')();
    clearFilterButtonRow('race')();
    clearFilterButtonRow('star')();
    clearFilterButtonRow('charge')();
    clearFilterButtonRow('genre')();
    clearFilterButtonRow('tag')();
    clearFilterButtonRow('activate')();
    clearFilterButtonRow('mode')();
    clearFilterButtonRow('armed')();
    clearKeyword();
}

function getSelectedButton(name, getFirstOnly = false) {
    const result_set = new Set();
    let hasSelected = false;
	
    $(`.${name}-row .filter`).each(function() {
        if($(this).prop('checked'))
        {
            result_set.add(getFirstOnly ? parseInt($(this).next("label").text()[0]) : $(this).next("label").text().trim());
            hasSelected = true;
        }
    });
    
    return [result_set, hasSelected]
}

function andOrChange(event, offset = 1)
{
	const cur_index = or_filter_value.indexOf(or_filter)
    or_filter = or_filter_value[(cur_index + offset) % or_filter_value.length]
    
	$("#and_or_filter").removeClass("btn-warning").removeClass("btn-danger")
	
	switch(or_filter) {
		case 'or':
			$("#and_or_filter").addClass("btn-warning").text("OR 搜尋")
		break
		case 'and':
			$("#and_or_filter").addClass("btn-danger").text("AND 搜尋")
		break
		case 'm-and':
			$("#and_or_filter").addClass("btn-danger").text("M-AND 搜尋")
		break
	}
}

function renderTags(data, classType, postAppend = "") {
    let tag_html = "";
    
    [...data].forEach((element) => {
        tag_html += `
            <div class="col-12 col-sm-3 tag_wrapper">
                <div class="${classType}_tag" title="${element}${postAppend}">${element}${postAppend}</div>
            </div>
        `;
    });
    
    return tag_html;
}

function paddingZeros(x, num)
{
    const str = x.toString();
    return str.length < num ? "0".repeat(num-str.length) + str : str;
}

function getPosition(id)
{
    let element = $(`#${id}`).get(0);
    let left = 0;
    let top = 0;
    const top_padding_offset = 90;

    do {
        left += element.offsetLeft;
        top += element.offsetTop;
    } while(element = element.offsetParent);

    return [0, top - top_padding_offset];
}

function jumpTo(id)
{
    window.scrollTo(getPosition(id)[0], getPosition(id)[1]);
}

function toggleSideNavigation() {
    const sideNav = $(".side_navigation")[0];
    sideNav.style.width = sideNav.style.width == "250px" ? "0px" : "250px";
}

function renderSettings(toolSettings) {
	return toolSettings.filter(setting => setting?.display !== false).map(setting => {
		return `
			<div class='setting-row ${setting?.className}-row' onclick='${setting?.callback}; ${setting?.hideAfterClick ? 'hideSetting()' : ''}'>
				<button type='button' id='${setting?.id}' class='${setting?.className}'>
					${setting?.content}
				</button>
				<div class='setting-desc'>
					${setting?.description}
				</div>
			</div>
		`
	}).join('')
}

function updateSetting(updatedSettings) {
	$('.setting-panel').html(renderSettings(updatedSettings))
}

function toggleSetting() {
	$('.setting-panel').fadeToggle(200)
}

function hideSetting() {
	$('.setting-panel').fadeOut(200)
}

function errorAlert(index)
{
    switch(index) {
        case 1:
            alert("[Error Code "+paddingZeros(index, 2)+"] 請檢查網址是否正確")
        break;
        case 2:
            alert("[Error Code "+paddingZeros(index, 2)+"] 請先選擇功能")
        break;
        case 3:
            alert("[Error Code "+paddingZeros(index, 2)+"] 請輸入技能關鍵字")
        break;
        case 4:
            alert("[Error Code "+paddingZeros(index, 2)+"] 技能關鍵字數量不得超過 " + input_maxlength)
        break;
        case 5:
            alert("[Error Code "+paddingZeros(index, 2)+"] 請輸入 UID")
        break;
        case 6:
            alert("[Error Code "+paddingZeros(index, 2)+"] 未發現背包資料，請先匯入背包")
        break;
        case 7:
            alert("[Error Code "+paddingZeros(index, 2)+"] 請輸入驗證碼")
        break;
        case 8:
            alert("[Error Code "+paddingZeros(index, 2)+"] 請先選擇龍刻")
        break;
        case 9:
            alert("[Error Code "+paddingZeros(index, 2)+"] 輸入格式錯誤 (僅接受數字及空格)")
        break;
        case 10:
            alert("[Error Code "+paddingZeros(index, 2)+"] 無法取得背包資料\n請確認是否已於官方健檢中心的個人資料勾選「公開背包」")
        break;
        case 11:
            alert("[Error Code "+paddingZeros(index, 2)+"] 請先選擇標籤")
        break;
        case 12:
            alert("[Error Code "+paddingZeros(index, 2)+"] 本工具不支援此帳號")
        break;
        default:
            
    }
}

function textSanitizer(text)
{
    return text.replace(/<board\s*(\d*)>([\S\s]*?)<\/board>/g, `$2`).replace(/<span([\S\s]*?)>([\S\s]*?)<\/span>/g, `$2`).replace(/<font([\S\s]*?)>([\S\s]*?)<\/font>/g, `$2`).replace(/<br>/g,'').replace(/\s/g,'').toLowerCase();
}

function stringToUnicode(str)
{
	let unicodeStr = ""
	str.split('').forEach((c) => {
		unicodeStr += "u" + c.charCodeAt(0).toString(16)
	})
	
	return unicodeStr
}

function unicodeToString(str)
{
	let textStr = ""
	str.split("u").slice(1).forEach((c) => {
		textStr += String.fromCharCode(parseInt(c, 16))
	})
	
	return textStr
}

function encode(type)
{
    let cnt = 1, enc_bin = 0;
    let str = "";
    
    $(`${type} .filter`).each(function() {
        enc_bin = enc_bin * 2 + ($(this).prop('checked') ? 1 : 0);
        if(cnt % 6 == 0)
        {
            str += encode_chart[enc_bin];
            enc_bin = 0;
        }
        cnt ++;
    });
    
    while(cnt % 6 != 1)     // padding for zeros
    {
        enc_bin = enc_bin * 2;
        if(cnt % 6 == 0)
        {
            str += encode_chart[enc_bin];
            enc_bin = 0;
        }
        cnt ++;
    }

    return str;
}

function decode(data)
{
    let bin_str = "";
    
    $.each([...data], (data_index, input) => {
        $.each(encode_chart, (code_index, code) => {
            if(input === code)
            {
                let bin_str_part = "";
                Array.from(Array(6)).forEach(() => {
                    bin_str_part += (code_index % 2).toString();
                    code_index = Math.trunc(code_index / 2);
                })
                bin_str += bin_str_part.split('').reverse().join('');
            }
        })
    })

    return bin_str;
}

function isTypeSelected(type) {
	let checked = false;
	$(`${type} .filter`).each(function() {
        if($(this).prop('checked')) {
			checked = true;
			return;
		}
    });
	return checked
}

function setButtonFromUrl(type, data, callback)
{
    callback();
    
    let cnt = 0;
    $(`${type} .filter`).each(function(){
        if(data[cnt] == '1') $(this).click();
        cnt ++;
    });
}

function setInputFromUrl(element, data)
{
    $(element).val(data);
}

function changeUrl()
{
    let search_str = isTypeSelected(".filter-row") ? `search=${encode(".filter-row")}&` : ''
    let keyword_str = stringToUnicode(textSanitizer($('#keyword-input').val())).length > 0 ? `keyword=${stringToUnicode(textSanitizer($('#keyword-input').val()))}&` : ''
    let attr_str = isTypeSelected(".attr-row") ? `attr=${encode(".attr-row")}&` : ''
    let race_str = isTypeSelected(".race-row") ? `race=${encode(".race-row")}&` : ''
    let star_str = isTypeSelected(".star-row") ? `star=${encode(".star-row")}&` : ''
    let charge_str = isTypeSelected(".charge-row") ? `chrg=${encode(".charge-row")}&` : ''
    let genre_str = isTypeSelected(".genre-row") ? `gnr=${encode(".genre-row")}&` : ''
    let tag_str = isTypeSelected(".tag-row") ? `tag=${encode(".tag-row")}&` : ''
    let mode_str = isTypeSelected(".mode-row") ? `mode=${encode(".mode-row")}&` : ''
    let actv_str = isTypeSelected(".activate-row") ? `actv=${encode(".activate-row")}&` : ''
    let armed_str = isTypeSelected(".armed-row") ? `armed=${encode(".armed-row")}&` : ''
    let or_str = `or=${or_filter_value.indexOf(or_filter)}&`
    let option_str = (typeof changeOptionsUrl === 'function' && isTypeSelected(".filter-row")) ? `opt=${changeOptionsUrl()}&` : ''
	
	let queryStr = `${search_str}${armed_str}${keyword_str}${attr_str}${race_str}${star_str}${charge_str}${genre_str}${tag_str}${mode_str}${actv_str}${option_str}${or_str}`
	queryStr = 	queryStr.length > 0 ? 
					queryStr.endsWith('&') ? 
						`?${queryStr.slice(0, -1)}` :
						`?${queryStr}`
						
				: ''
    window.history.pushState(null, null, queryStr);
}

function readUrl()
{   
    let code_array = location.search.split("&").map(x => x.split("=")[1]);
    let code_name_array = location.search.split("?")[1].split("&").map(x => x.split("=")[0]);
	
	let inputQuery = {};
	location.search.split("?")[1].split("&").forEach(query => inputQuery[query.split('=')[0]] = query.split('=')[1])
    
	inputQuery['search'] && setButtonFromUrl(".filter-row", decode(inputQuery['search']), clearFilterButtonRow('filter'));
	inputQuery['keyword'] && setInputFromUrl(".keyword-input", unicodeToString(inputQuery['keyword']));
    
	'attr' in inputQuery && setButtonFromUrl(".attr-row", decode(inputQuery['attr']), clearFilterButtonRow('attr'));
	'race' in inputQuery && setButtonFromUrl(".race-row", decode(inputQuery['race']), clearFilterButtonRow('race'));
	'star' in inputQuery && setButtonFromUrl(".star-row", decode(inputQuery['star']), clearFilterButtonRow('star'));
	'chrg' in inputQuery && setButtonFromUrl(".charge-row", decode(inputQuery['chrg']), clearFilterButtonRow('charge'));
	'gnr' in inputQuery && setButtonFromUrl(".genre-row", decode(inputQuery['gnr']), clearFilterButtonRow('genre'));
	'tag' in inputQuery && setButtonFromUrl(".tag-row", decode(inputQuery['tag']), clearFilterButtonRow('tag'));
	'actv' in inputQuery && setButtonFromUrl(".activate-row", decode(inputQuery['actv']), clearFilterButtonRow('activate'));
	'mode' in inputQuery && setButtonFromUrl(".mode-row", decode(inputQuery['mode']), clearFilterButtonRow('mode'));
	'armed' in inputQuery && setButtonFromUrl(".armed-row", decode(inputQuery['armed']), clearFilterButtonRow('armed'));
	'or' in inputQuery && andOrChange(null, parseInt(inputQuery['or']));
	'opt' in inputQuery && typeof setOptionsFromUrl === 'function' && setOptionsFromUrl(decode(inputQuery['search']), inputQuery['opt'])
    
    startFilter();
    
    window.history.pushState(null, null, location.pathname);    // clear search parameters
}

async function getPlayerInventory(prefix, id = null) 
{
	const playerId = id ?? $(`#${prefix}-uid-input`).val().toString().trim()
	const playerVeri = $(`#${prefix}-veri-input`)?.val()?.toString().trim()
	const verb = prefix === 'load' ? '匯入' : '更新'
	
	const blackList = [
		'811310887', '795656880', // https://forum.gamer.com.tw/C.php?bsn=23805&snA=706545
	]	
	const isBlackList = blackList.includes(playerId)
	
	if(playerId.length === 0) {
		errorAlert(5);
		return ;
	}
	else if(prefix === 'update' && playerVeri.length === 0) {
		errorAlert(7);
		return ;
	}
	
	$(`#${prefix}-uid-input`).attr('disabled', true)
	
	$(`#${prefix}-uid-status`).html(`<span class='waiting'><i class='fa fa-download'></i>&nbsp;&nbsp;正在${verb} ${playerId} 的背包...</span>`)
	
	const uid = prefix == 'update' ? playerId : atob(myAuth).substring(0, 10)
	const auth = prefix == 'update' ? playerVeri : atob(myAuth).substring(10, 16)
	
	try {
		if(isBlackList) {
			throw ''
		}
		
		const token_obj = await $.post(`https://website-api.tosgame.com/api/checkup/login?token=&uid=${uid}&auth=${auth}`).fail(() => {
			console.log('Fail to get token')
		}).promise()
		
		const token = token_obj?.token ?? ''
		
		const inventory_data = await $.get(`https://website-api.tosgame.com/api/checkup/getUserProfile?targetUid=${playerId}&token=${token}`).fail(() => {
			console.log('Fail to get inventory data')
		}).promise()
		
		if(inventory_data) {
			const card_set = new Set()
			const card_info = {}
		
			inventory_data?.userData?.cards.forEach(card => {
				card_set.add(card.id)
				
				if(card_info?.[card.id]) {
					card_info[card.id].number = card_info[card.id].number + 1
					
					if(	card_info[card.id]?.level < card.level || 
						card_info[card.id]?.skillLevel < card.skillLevel || 
						card_info[card.id]?.enhanceLevel < card.enhanceLevel
					) {
						card_info[card.id].level = card.level
						card_info[card.id].skillLevel = card.skillLevel
						card_info[card.id].enhanceLevel = card.enhanceLevel
					}
				}
				else {
					card_info[card.id] = {
						number: 1, 
						level: card?.level || 0, 
						skillLevel: card?.skillLevel || 0, 
						enhanceLevel: card?.enhanceLevel || 0
					}
				}
				
			})
			
			setPlayerData(prefix, playerId, inventory_data?.userData?.displayName, [...card_set].sort((a, b) => a - b), card_info, inventory_data?.userData?.cardsUpdatedAt, inventory_data?.userData?.cards || [])
		}
	} catch {
		if(isBlackList) {
			$(`#${prefix}-uid-status`).html(`<span class='fail'><i class='fa fa-times'></i>&nbsp;&nbsp;本工具不支援此帳號</span>`)
			$(`#${prefix}-uid-input`).attr('disabled', false)
		} else {
			$(`#${prefix}-uid-status`).html(`<span class='fail'><i class='fa fa-times'></i>&nbsp;&nbsp;${verb}失敗${verb === '匯入' ? '，請嘗試使用更新背包功能' : ''}</span>`)
			$(`#${prefix}-uid-input`).attr('disabled', false)
		}
		
		if(isBlackList) {
			errorAlert(12)
		} else if(id) {
			errorAlert(10)
		}
		
		playerData = {uid: '', card: [], info: {}, wholeData: []}
		$('.uid-banner').length && $('.uid-banner').html(`UID: ${playerId}`)
		setUpdateBanner()
		showSeal && showSeal(currentSeal)
	}
}

function setPlayerData(prefix, uid, name, card, info, lastUpdated, wholeData)
{
	const verb = prefix === 'load' ? '匯入' : '更新'
	
	playerData.uid = uid
	playerData.name = name || ''
	playerData.card = addCombinedCard(addTransformedCard(addVirtualRebirthCard(card)))
	playerData.info = info
	playerData.lastUpdated = lastUpdated ? new Date(new Date(lastUpdated) - new Date().getTimezoneOffset()).toLocaleString() : null
	playerData.wholeData = wholeData.sort((a, b) => b.acquiredAt - a.acquiredAt)
	
	
	$(`#${prefix}-uid-status`).html(`<span class='success'><i class='fa fa-check'></i>&nbsp;&nbsp;${verb}完成</span>`)
	
	renderResult()
	$(`#${prefix}-confirm-uid`).css({'display': 'none'})
	$(`#${prefix}-save-inventory`).css({'display': 'block'})
	
	setUpdateBanner()
	$('.uid-banner').length && $('.uid-banner').html(playerData?.uid ? `UID: ${playerData.uid}` : '')
	
	if(tool_id === 'backpack') {
		const uidStr = `?uid=${playerData.uid}`
		window.history.pushState(null, null, uidStr)
		
		filteredMonster = playerData.wholeData
		selectedAttr = []
		selectedRace = []
		selectedStar = []
		currentPage = 1
		
		startFilter(true)
	}
}

function setUpdateBanner()
{
	$('.update-banner').length && $('.update-banner').html( `上次更新: ${ playerData?.lastUpdated || '---'}`)
}

function addVirtualRebirthCard(allCard)
{
	const virtualRebirth = new Set();
	
	$.each(allCard, (card_index, card) => {
		const vrId = monster_data.find((monster) => monster.id === card)?.vrPair
		virtualRebirth.add(vrId)
	})
	
	return allCard.concat(Array.from(virtualRebirth))
}

function addTransformedCard(allCard)
{
	let allCards = allCard;
	let transformed = [];
	let currentStage = allCard;
	
	// need to check multiple stage transform monster
	while(currentStage.length > 0) {
		$.each(currentStage, (card_index, card) => {
			const transform_skill = monster_data.find((monster) => monster.id === card)?.skill?.filter((skill) => 'transform' in skill)
			$.each(transform_skill, (skill_index, skill) => {
				if(!allCards.includes(skill.transform)) transformed.push(skill.transform)
			})
		})
		currentStage = transformed;
		allCards = allCards.concat(transformed);
		transformed = [];
	}
	
	return allCards
}

function addCombinedCard(allCard)
{
	const combined = new Set();
	
	$.each(allCard, (card_index, card) => {
		const combine_skill = monster_data.find((monster) => monster.id === card)?.skill?.filter((skill) => 'combine' in skill)
		$.each(combine_skill, (skill_index, skill) => {
			const members = skill.combine.member
			let canCombine = true
			$.each(members, (member_index, member) => {
				if(!allCard.includes(member)) {
					canCombine = false;
					return false;
				}
			})
			canCombine && combined.add(skill.combine.out)
		})
	})
	
	return allCard.concat(Array.from(combined))
}

function savePlayerInventory(prefix)
{
	localStorage.setItem('PLAYER_DATA', JSON.stringify(playerData))
	$(`#${prefix}-uid-status`).html(`<span class='success'><i class='fa fa-check'></i>&nbsp;&nbsp;儲存背包完成</span>`)
	renderResult()
}

function inventorySwitch()
{
	if(!useInventory && playerData?.card.length === 0) {
		errorAlert(6);
		return ;
	}
	
	useInventory = !useInventory
	renderResult()
	$("#use-inventory").text(useInventory ? '我的背包' : '全部結果')
	$("#uid-tag").css({'display': useInventory ? 'inline-block' : 'none'})
}

const theme_string = [
	'--background_color', 
	'--text_color', 
	'--text_color_anti', 
	'--text_color_uid', 
	'--button_color', 
	'--button_text_color_checked', 
	'--button_filter_color_checked', 
	'--button_filter_color_2_checked', 
	'--button_keyword_color_checked', 
	'--button_keyword_color_unable', 
	'--button_keyword_color_input_able', 
	'--button_keyword_color_input_unable', 
	'--button_tag_color_checked', 
	'--button_other_color_checked', 
	'--button_sortby', 
	'--button_primary',
	'--button_warning',
	'--button_danger',
	'--button_success',
	'--button_secondary',
	'--text_tag_color', 
	'--monsterid_color', 
	'--text_monsterid_color', 
	'--tooltip_color', 
	'--text_tooltip_color', 
	'--text_name_tooltip_color', 
	'--text_refine_tooltip_color', 
	'--text_recall_tooltip_color', 
	'--text_charge_tooltip_color',
	'--text_charge_sort_color',
	'--text_board_label_color',
	'--text_desc_label_color',
	'--text_positive_label_color',
	'--text_negative_label_color',
	'--text_multiple_color',
	'--text_input_color',
	'--table_border',
	'--table_border_center',
	'--table_td_selected_background',
	'--text_monster_name_water_color',
	'--text_monster_name_fire_color',
	'--text_monster_name_earth_color',
	'--text_monster_name_light_color',
	'--text_monster_name_dark_color',
	'--div_selector_result_background',
	'--div_selector_result_success_background',
	'--div_nav_active_background',
	'--div_series_genre_background',
	'--div_series_genre_all_background',
	'--text_series_genre_all',
	'--div_series_genre_must_get_background',
	'--text_series_genre_must_get',
	'--notification_background',
	'--notification_text',
	'--image_brightness'
];

function setTheme(theme)
{
	$.each(theme_string, (index, name) => {
        document.documentElement.style.setProperty(name, `var(${name}_${theme})`);
    });
	
	const _settingIndex = settings.findIndex(setting => setting.id === 'changeTheme-btn')
	settings[_settingIndex] = {
		...settings[_settingIndex],
		description: `${theme == 'normal' ? '淺色' : '深色'}主題`,
	}
	updateSetting(settings)
}

function changeTheme()
{
	pressChangeThemeTime += 1
	if(pressChangeThemeTime === 30) {
		alert("...看來電燈開關被按壞了\n\n請重新整理頁面以修好開關")
	}
	else if(pressChangeThemeTime === 60) {
		alert("不是，多按幾次也不會修好，真的")
	}
	else if(pressChangeThemeTime === 90) {
		alert("看吧，我就說不會這樣就修好的")
	}
	else if(pressChangeThemeTime === 120) {
		alert("太有毅力了吧\n...雖然開關依舊是壞的")
	}
	else if(pressChangeThemeTime === 150) {
		alert("要不要猜猜看再多按幾次會怎樣？")
	}
	else if(pressChangeThemeTime === 180) {
		alert("等等我開玩笑的，真的沒東西了\n\n請重新整理頁面以修好開關")
	}
	else if(pressChangeThemeTime >= 181) {
		alert("請重新整理頁面以修好開關")
	}
	
	if(pressChangeThemeTime >= 30) return;
	
    theme = (theme == 'normal') ? 'dark' : 'normal';
    localStorage.setItem('TOOL_THEME', theme)
    
    setTheme(theme)
}

// Saitama easter egg :)
function setGlassBreak() {
	function showGlassBreak(x, y) {
		const scale = 0.8 + Math.random() * 0.6
		const angle = Math.random() * 360
		$('<img/>',{
			src: '../tos_tool_data/img/other/glass_break.png',
			style: `position: absolute; left: ${x - 100}px; top: ${y - 100}px; pointer-events: none; user-select: none; opacity: 0.8; transform: rotate(${angle}deg) scale(${scale});`,
			unselectable: 'on'
		}).appendTo('body');
	}
	
	function toggleClass(target) {
		$(target).toggleClass('shake-small')
	}
	
	$('img[class^="monster_img"][src$="/10294.png"]').click(function(e){
		showGlassBreak(event.pageX, event.pageY)
		toggleClass(e.target)
		setTimeout(() => toggleClass(e.target), 200)
	});
}

// Neo: HelloWorld easter egg :)
function setBlueCircles() {
	function showBlueCircles(x, y) {
		const scale = 0.4
		const angle = Math.random() * 360
		$('<img/>',{
			id: 'blue-circle-effect',
			src: '../tos_tool_data/img/monster/10212.png',
			style: `
						position: absolute; 
						left: ${x}px; 
						top: ${y}px; 
						pointer-events: none; 
						user-select: none; 
						opacity: 0.8; 
						transform-origin: center;
						transform: rotate(${angle}deg);
						animation-name: move-blue-circle;
						animation-duration: 0.7s;
						animation-fill-mode: forwards;
					`,
			unselectable: 'on'
		}).appendTo('body');
	}
	
	$('img[class^="monster_img"][src$="/10212.png"]').click(function(e){
		showBlueCircles(event.pageX, event.pageY)
	});
}

// Jotaro and Dio easter egg :)
function setOraMuda() {
	function showOraMuda(x, y, text) {
		const scaleRange = { min: 0.5, max: 0.8 }
		const angleRange = { min: -20, max: 20 }
		const posRange = { min: 50, max: 80 }
		
		const scale = scaleRange.min + Math.random() * (scaleRange.max - scaleRange.min)
		const angle = angleRange.min + Math.random() * (angleRange.max - angleRange.min)
		const posOffset = { 
			x: (posRange.min + Math.random() * (posRange.max - posRange.min)) * (Math.round(Math.random()) * 2 - 1), 
			y: (posRange.min + Math.random() * (posRange.max - posRange.min)) * (Math.round(Math.random()) * 2 - 1)
		}
		
		const stamp = Date.now()
		$('<img/>',{
			src: `../tos_tool_data/img/other/${text}.png`,
			style: `position: absolute; left: ${x - 100 + posOffset.x}px; top: ${y - 100 + posOffset.y}px; pointer-events: none; user-select: none; opacity: 1; transform: rotate(${angle}deg) scale(${scale}); z-index: 10000;`,
			unselectable: 'on',
			id: `${text}-${stamp}`
		}).appendTo('body').fadeOut(500, () => {
			$(`#${text}-${stamp}`).remove()
		});
	}
	
	function showImpact(x, y) {
		const scale = 0.7;
		const angle = Math.random() * 360
		const posRange = { min: 0, max: 20 }
		
		const posOffset = { 
			x: (posRange.min + Math.random() * (posRange.max - posRange.min)) * (Math.round(Math.random()) * 2 - 1), 
			y: (posRange.min + Math.random() * (posRange.max - posRange.min)) * (Math.round(Math.random()) * 2 - 1)
		}
		
		const stamp = Date.now()
		$('<img/>',{
			src: `../tos_tool_data/img/other/impact.png`,
			style: `position: absolute; left: ${x - 100 + posOffset.x}px; top: ${y - 100 + posOffset.y}px; pointer-events: none; user-select: none; opacity: 0.6; transform: rotate(${angle}deg) scale(${scale}); z-index: 10000;`,
			unselectable: 'on',
			id: `impact-${stamp}`
		}).appendTo('body').fadeOut(200, () => {
			$(`#impact-${stamp}`).remove()
		});
	}
	
	function toggleClass(target) {
		$(target).toggleClass('shake-small')
	}
	
	$('img[class^="monster_img"][src$="/10581.png"], img[class^="monster_img"][src$="/10581_sp.png"], img[class^="monster_img"][src$="/10895.png"], img[class^="monster_img"][src$="/10916.png"]').click(function(e){
		showImpact(event.pageX, event.pageY)
		showOraMuda(event.pageX, event.pageY, 'ora')
		toggleClass(e.target)
		setTimeout(() => toggleClass(e.target), 200)
	});
	
	$('img[class^="monster_img"][src$="/10598.png"], img[class^="monster_img"][src$="/10598_sp.png"], img[class^="monster_img"][src$="/10898.png"], img[class^="monster_img"][src$="/10899.png"]').click(function(e){
		showImpact(event.pageX, event.pageY)
		showOraMuda(event.pageX, event.pageY, 'muda')
		toggleClass(e.target)
		setTimeout(() => toggleClass(e.target), 200)
	});
}