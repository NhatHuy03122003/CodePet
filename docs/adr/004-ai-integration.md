# ADR 004: AI Integration Strategy

## Status
Accepted

## Context
CodePet requires AI-powered comment generation to:
- Provide engaging mascot comments on commits
- Celebrate streak achievements
- Encourage users on level-ups
- Generate personalized greetings
- Maintain a consistent mascot personality

Requirements:
- Natural language generation for comments
- Context-aware responses (based on commit type, streak, etc.)
- Adjustable tone/personality
- Cost-effective for MVP
- Fast response times
- Caching to reduce API costs
- Ability to switch providers if needed

## Decision
We selected OpenAI API as the primary AI provider with intelligent caching and cost optimization strategies.

### Technology Choices

#### AI Provider: OpenAI API
**Rationale:**
- **Market Leader**: Most widely used and tested LLM API
- **Quality**: Best natural language generation quality
- **Multiple Models**: GPT-3.5 (fast, cheap) and GPT-4 (high quality)
- **Reliability**: Stable API with good uptime
- **Documentation**: Excellent documentation and examples
- **Ecosystem**: Large community and third-party tools
- **TypeScript SDK**: Official TypeScript support
- **Flexibility**: Can switch to other providers later if needed

#### Model Selection Strategy
- **GPT-3.5-turbo**: Default for most comment generation
  - Fast response times (~1-2 seconds)
  - Low cost ($0.002/1K tokens)
  - Good quality for simple comments
- **GPT-4**: Used for complex scenarios
  - Better quality and nuance
  - Slower response times (~5-10 seconds)
  - Higher cost ($0.03/1K input tokens, $0.06/1K output tokens)
  - Used for milestone celebrations, complex contexts

### Implementation Details

#### Comment Generation Flow

1. **Trigger Event**
   - New commit pushed
   - Streak milestone reached
   - Level up achieved
   - User manually requests comment

2. **Context Building**
   - Gather relevant data (commit message, streak count, mascot level)
   - Select appropriate prompt template
   - Apply user's preferred tone

3. **Cache Check**
   - Check if similar comment already generated
   - Return cached comment if available
   - Skip API call and save cost

4. **API Call**
   - Call OpenAI API with constructed prompt
   - Use appropriate model (GPT-3.5 or GPT-4)
   - Include system prompt for mascot personality

5. **Response Processing**
   - Validate response length and content
   - Apply tone adjustments if needed
   - Store in database
   - Cache for future use

6. **Cost Tracking**
   - Track token usage
   - Calculate cost
   - Store in database for monitoring

#### Prompt Engineering

**System Prompt (Mascot Personality):**
```
You are Byte, a friendly AI coding companion fox. You are encouraging,
supportive, and sometimes witty. You celebrate coding achievements and
provide motivational comments. Keep comments concise (1-2 sentences) and
engaging. Use emojis occasionally but don't overdo it.
```

**Comment Type Prompts:**

1. **Commit Comment:**
```
Context: User made a commit with message: "{commitMessage}"
Repository: {repositoryName}
Tone: {tone}

Generate a brief, encouraging comment about this commit.
```

2. **Streak Achievement:**
```
Context: User has maintained a {streakCount} day coding streak!
Tone: {tone}

Generate an enthusiastic comment celebrating this streak achievement.
```

3. **Level Up:**
```
Context: User's mascot Byte just reached level {newLevel}!
Tone: {tone}

Generate an exciting comment celebrating this level up.
```

#### Caching Strategy

**Cache Key Generation:**
```typescript
function generateCacheKey(context: CommentContext, tone: string): string {
  const hash = sha256(JSON.stringify({ context, tone }))
  return `comment:${hash}`
}
```

**Cache Layers:**
1. **In-Memory Cache** (Redis or Node.js cache)
   - TTL: 24 hours
   - Fast access
   - Shared across requests

2. **Database Cache**
   - Store AI responses in `AIComment` table
   - Link multiple comments to same AI response
   - Persistent cache

**Cache Invalidation:**
- Time-based expiration
- Manual invalidation on user preference change
- Comment type-specific cache keys

#### Cost Optimization

**Strategies:**
1. **Model Selection**
   - Use GPT-3.5 for 80% of comments
   - Use GPT-4 only for special occasions (milestones, level-ups)

2. **Caching**
   - 60-70% cache hit rate expected
   - Significant cost reduction

3. **Prompt Optimization**
   - Keep prompts concise
   - Use specific instructions
   - Limit response length (max tokens: 100)

4. **Batch Processing**
   - Process multiple comments in single API call where possible
   - Reduce API overhead

5. **User Limits**
   - Rate limit per user (10 comments/hour)
   - Daily budget per user ($0.50/day)

**Cost Estimates:**
- Average comment: 50 input tokens, 30 output tokens
- GPT-3.5 cost: $0.002 * (0.08 + 0.03) = $0.00022 per comment
- With 70% cache hit: $0.000066 per effective comment
- 100 active users, 10 comments/day: $0.066/day = $2/month
- Comfortable within MVP budget

#### Error Handling

**Fallback Strategy:**
1. **Primary**: Try OpenAI API
2. **Fallback 1**: Use pre-defined comment templates
3. **Fallback 2**: Simple encouraging message

**Error Scenarios:**
- API rate limit exceeded: Queue request, retry later
- API error: Use fallback template
- Invalid response: Use fallback template
- Timeout: Use fallback template

#### Monitoring

**Metrics to Track:**
- API call count per day
- Token usage per day
- Cost per day
- Cache hit rate
- Average response time
- Error rate

**Alerts:**
- Daily cost exceeds $10
- Error rate exceeds 5%
- Average response time exceeds 5 seconds

### Alternatives Considered

#### Anthropic Claude
**Pros:**
- Good quality outputs
- More context window
- Safer by design

**Cons:**
- Less mature ecosystem
- Higher cost than GPT-3.5
- Fewer examples and community resources

**Decision:** OpenAI has better ecosystem, lower cost, and more proven track record.

#### Cohere
**Pros:**
- Good for text generation
- Competitive pricing

**Cons:**
- Smaller market share
- Less documentation
- Fewer integrations

**Decision:** OpenAI is more established with better support.

#### Local LLMs (Llama, Mistral)
**Pros:**
- No API costs
- Full control
- Privacy (data doesn't leave server)

**Cons:**
- Requires GPU resources
- Higher infrastructure cost
- More complex setup
- Lower quality than GPT-4
- Not suitable for MVP timeline

**Decision:** Too complex for MVP, OpenAI API is faster to implement.

#### Rule-Based Templates Only
**Pros:**
- No AI costs
- Predictable outputs
- Fast response times
- No dependencies

**Cons:**
- Limited variety
- Less engaging
- Can't adapt to context
- Feels robotic

**Decision:** AI provides much better user experience; worth the cost.

## Consequences

### Positive
- High-quality, engaging comments
- Natural language generation
- Context-aware responses
- Adjustable tone/personality
- Cost-effective with caching
- Fast response times
- Easy to switch providers if needed
- Scalable architecture

### Negative
- Ongoing API costs
- Dependency on third-party service
- Rate limits may affect user experience
- Need to monitor costs and usage
- API outages possible

### Risks
- OpenAI API outages or degradation
- Costs may exceed budget
- API rate limits during high traffic
- Quality degradation if model changes
- Privacy concerns (sending code to OpenAI)

### Mitigations
- Implement robust fallback system with templates
- Strict rate limiting and user budgets
- Comprehensive caching strategy
- Monitor costs and set alerts
- Have backup provider ready (Anthropic)
- Clear privacy policy about AI usage
- Option for users to opt-out of AI features

## Privacy Considerations

### Data Sent to OpenAI
- Commit messages (public data anyway)
- Repository names (public data)
- Streak counts (non-sensitive)
- Mascot levels (non-sensitive)

### Data NOT Sent
- User emails
- Authentication tokens
- Private code content
- Personal information

### Privacy Policy
- Clear disclosure of AI usage
- Option to disable AI features
- Data retention policy
- Compliance with GDPR if needed

## Future Enhancements

1. **Fine-Tuned Models**
   - Fine-tune GPT-3.5 on mascot-specific data
   - Better personality consistency
   - Reduced cost per call

2. **Multi-Provider Strategy**
   - Load balance between OpenAI and Anthropic
   - Automatic failover
   - Cost optimization

3. **Advanced Context**
   - Include code changes in context (with user permission)
   - More nuanced comments
   - Code review suggestions

4. **Voice Output**
   - Text-to-speech for mascot comments
   - More engaging experience
   - Accessibility improvement

5. **Custom Personalities**
   - User-defined mascot personalities
   - Custom tone and style
   - Personalized prompts

## Cost Management Plan

### MVP Phase
- Budget: $50/month for OpenAI API
- Expected usage: 100 users, 10 comments/day
- Cost: ~$2/month (well under budget)

### Growth Phase
- Budget: $200/month
- Expected usage: 1,000 users, 10 comments/day
- Cost: ~$20/month (with caching)

### Scale Phase
- Budget: $1,000/month
- Expected usage: 10,000 users, 10 comments/day
- Cost: ~$200/month (with caching)
- Consider fine-tuned model for cost reduction

## Performance Targets

- **Response Time**: < 3 seconds (p95)
- **Cache Hit Rate**: > 60%
- **Error Rate**: < 1%
- **Cost per Comment**: < $0.0005 (with caching)

## References
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [AI Safety Guidelines](https://platform.openai.com/docs/safety-overview)
