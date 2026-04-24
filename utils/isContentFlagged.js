const { AutoModerationRuleTriggerType } = require('discord-api-types/v10');
async function isContentFlagged(guild, content) {
    try {
        const rules = await guild.autoModerationRules.fetch();
        const text = String(content || '').toLowerCase();
        console.log('doggo is analyzing this text:', text);
        for (const rule of rules.values()) {
            if ( rule.triggerType === AutoModerationRuleTriggerType.Keyword || rule.triggerType === AutoModerationRuleTriggerType.MemberProfile ) {
                const keywords = rule.triggerMetadata.keywordFilter;
                const regexPatterns = rule.triggerMetadata.regexPatterns;
                if (keywords && keywords.length > 0) {
                    const isKeywordFlagged = keywords.some(rawKeyword => {
                        const cleanKeyword = rawKeyword.replace(/\*/g, '').toLowerCase();
                        return text.includes(cleanKeyword);
                    });
                    if (isKeywordFlagged) {
                        console.log("its flagged, my bad");
                        return true;
                    }
                }
                if (regexPatterns && regexPatterns.length > 0) {
                    const isRegexFlagged = regexPatterns.some(pattern => {
                        const regex = new RegExp(pattern, 'i');
                        return regex.test(text);
                    });
                    if (isRegexFlagged) {
                        console.log("this is flagged bruh");
                        return true;
                    }
                }
            } else if (rule.triggerType === AutoModerationRuleTriggerType.KeywordPreset) {
                console.log("oh look a keyword preset");
            }
        }
        return false;
    } catch (error) {
        console.error('an error happened, here:', error);
    }
}
module.exports = {
  isContentFlagged
};